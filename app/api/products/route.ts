import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  notFoundResponse,
  successResponse,
  unauthorizedResponse,
} from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { requireAuth, getAuthUser } from "@/lib/api/middleware";
import type {
  PaginatedResponse,
  ProductResponse,
  Assets,
  Variant,
} from "@/types/api";
import { ProductListDto } from "@/types/dto/product-list.dto";
import { ChannelType, ExternalProductIdType, Prisma } from "@prisma/client";
import { validateDto } from "@/lib/api/validation";
import { getFileUrl } from "@/lib/api/aws-s3";
import { CreateProductDto, ExternalProductIdTypeDto, VariantType } from "@/types/dto/create-product.dto";
import { UpdateAssetDto } from "@/types/dto/asset.dto";
import { generateSku, generateSlug } from "@/lib/api/misc";
import { CreateOfferDto } from "@/types/dto/create-offer.dto";
import { instanceToPlain } from "class-transformer";

// ==================================================
// Helper function
// ==================================================

const buildProductWhereClause = async (
  storeId: bigint,
  queryParams: ProductListDto
) => {
  const { search, status, categoryId, subCategoryId } = queryParams;
  const searchValue = search?.trim();

  const where: Prisma.ProductWhereInput = {
    storeId,
    status: { not: "DELETED" },
  };

  if (status) where.status = status;
  if (categoryId) where.categoryId = BigInt(categoryId);
  if (subCategoryId) where.subCategoryId = BigInt(subCategoryId);

  if (!searchValue?.length) return where;

  const upperSearchTerm = searchValue
    .toUpperCase()
    .split(",")
    .map((ele) => ele.trim()) as ChannelType[];

  const hasChannels = Object.values(ChannelType).some((channel) =>
    upperSearchTerm.includes(channel)
  );

  // Fetch category in parallel with other operations
  const category = await prisma.category.findFirst({
    where: {
      active: true,
      OR: [{ storeId }, { storeId: null }],
      name: { contains: searchValue, mode: "insensitive" },
    },
    select: { id: true },
  });

  const searchConditions: Prisma.ProductWhereInput["OR"] = [
    { title: { contains: searchValue, mode: "insensitive" } },
    { description: { contains: searchValue, mode: "insensitive" } },
    { hsnCode: { contains: searchValue, mode: "insensitive" } },
    ...(category ? [{ categoryId: BigInt(category.id) }] : []),
    {
      variants: {
        some: {
          OR: [
            { sku: { contains: searchValue, mode: "insensitive" } },
            ...(hasChannels
              ? [{ channels: { hasSome: upperSearchTerm } }]
              : []),
          ],
        },
      },
    },
  ];

  // Handle numeric ID search
  try {
    const searchBigInt = BigInt(searchValue);
    searchConditions.push({ id: searchBigInt });
  } catch {
    // Ignore conversion errors
  }

  where.AND = [{ OR: searchConditions }];
  return where;
};

const fetchCategories = async (products: ProductResponse[]) => {
  const categoryIds = [
    ...new Set(products.map((p) => p.categoryId).filter(Boolean)),
  ];

  if (categoryIds.length === 0) return new Map();

  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });

  return new Map(categories.map((cat) => [cat.id, cat]));
};

const fetchExternalData = async (
  products: ProductResponse[],
  storeId: bigint,
  enabledChannels: Set<string>
) => {
  const variantIds = products.flatMap((product) =>
    product.variants.map((variant) => String(variant.id))
  );

  if (variantIds.length === 0) return new Map();

  try {
    const inventoryItems = await prisma.inventory.findMany({
      where: {
        storeId: BigInt(storeId),
        variantId: { in: variantIds.map((variantId) => BigInt(variantId)) },
        channelStatus: "ACTIVE",
      },
      select: {
        id: true,
        variantId: true,
        onHand: true,
        channelType: true,
        allocated: true,
      },
    });

    const priceItems = await prisma.price.findMany({
      where: {
        storeId: BigInt(storeId),
        variantId: { in: variantIds.map((variantId) => BigInt(variantId)) },
        channelStatus: "ACTIVE",
      },
      select: {
        id: true,
        variantId: true,
        channelType: true,
        mrp: true,
        price: true,
      },
    });

    const uniqueItems = new Set([
      ...inventoryItems.map((item) => `${item.variantId}_${item.channelType}`),
      ...priceItems.map((item) => `${item.variantId}_${item.channelType}`),
    ]);

    const mergedData = Array.from(uniqueItems).map((item) => {
      const { id: iid, ...inventoryItem } = (inventoryItems.find(
        (i) => `${i.variantId}_${i.channelType}` === item
      ) || {}) as {
        id: bigint;
        variantId: bigint;
        channelType: ChannelType;
        onHand: number;
        allocated: number;
      };

      const { id: pid, ...priceItem } = (priceItems.find(
        (p) => `${p.variantId}_${p.channelType}` === item
      ) || {}) as {
        id: bigint;
        price: number;
        variantId: bigint;
        channelType: ChannelType;
        mrp: number;
      };

      return {
        inventoryId: iid,
        priceId: pid,
        ...inventoryItem,
        ...priceItem,
      };
    });

    if (!mergedData) {
      return new Map();
    }

    const responseData: Array<{
      price: number;
      variantId: bigint;
      channelType: ChannelType;
      mrp: number;
      onHand: number;
      allocated: number;
      inventoryId: bigint;
      priceId: bigint;
    }> = mergedData;

    // Group data by variantId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variantDataMap = new Map<string, any[]>();

    responseData.forEach((data) => {
      if (enabledChannels.has(data.channelType)) {
        const channelData = {
          channelType: data.channelType,
          price: data.price / 100,
          mrp: data.mrp / 100,
          onHand: data.onHand,
          allocated: data.allocated,
          inventoryId: data.inventoryId,
          priceId: data.priceId,
        };

        const existing = variantDataMap.get(String(data.variantId)) || [];
        existing.push(channelData);
        variantDataMap.set(String(data.variantId), existing);
      }
    });

    return variantDataMap;
  } catch (error) {
    console.error({
      message: "Error fetching external product data",
      error: error,
    });
    return new Map();
  }
};

const processAssets = async (assets: Assets[]) => {
  if (assets.length === 0) return assets;

  const processedAssets = await Promise.all(
    assets.map(async (asset) => ({
      ...asset,
      assetUrl: await getFileUrl(asset.uri),
    }))
  );

  return processedAssets;
};

const processVariants = async (
  variants: Variant[],
  enabledChannels: Set<string>
) => {
  const processedVariants = await Promise.all(
    variants.map(async (variant) => {
      const variantEnabledChannels = new Set(variant.channels);
      const commonChannels = Array.from(
        new Set(
          [...variantEnabledChannels].filter((x: string) =>
            enabledChannels.has(x)
          )
        )
      );

      const processedAssets = await processAssets(variant.assets);

      return {
        ...variant,
        channels: commonChannels,
        assets: processedAssets,
      };
    })
  );

  return processedVariants;
};

const processProducts = async (
  products: ProductResponse[],
  enabledChannels: Set<string>
) => {
  const assetProcessing = products.map(async (product) => {
    const [processedAssets, processedVariants] = await Promise.all([
      processAssets(product.assets),
      processVariants(product.variants, enabledChannels),
    ]);

    return {
      ...product,
      assets: processedAssets,
      variants: processedVariants,
    };
  });

  return Promise.all(assetProcessing);
};

const createOffer = async (createOfferDto: CreateOfferDto[], storeId: bigint) => {
  const result = await prisma.$transaction(async (tx) => {
    const createInventoryItemsData = await Promise.all(
      createOfferDto.map(async (item) => {
        const [{ next_id: id }] = await tx.$queryRaw<{ next_id: bigint }[]>`
SELECT public.next_id() as next_id`;
        return {
          inventoryId: String(id),
          storeId: storeId,
          variantId: item.variantId,
          channelType: item.channelType,
          quantity: item.quantity,
        };
      })
    );

    await tx.inventory.createMany({
      data: createInventoryItemsData.map((item) => {
        return {
          id: BigInt(item.inventoryId),
          variantId: BigInt(item.variantId),
          channelType: item.channelType,
          storeId: BigInt(item.storeId),
          onHand: item.quantity,
        };
      }),
    });

    await tx.inventoryTransaction.createMany({
      data: createInventoryItemsData.map((item) => {
        return {
          inventoryId: BigInt(item.inventoryId),
          storeId: BigInt(item.storeId),
          type: "ADD",
          quantity: item.quantity,
          metadata: {
            triggered_by: "CREATE_INVENTORY",
          },
        };
      }),
    });

    const createPriceItemsData = await Promise.all(
      createOfferDto.map(async (item) => {
        const [{ next_id: id }] = await tx.$queryRaw<{ next_id: bigint }[]>`
SELECT public.next_id() as next_id`;
        return {
          priceId: String(id),
          channelType: item.channelType,
          mrp: item.mrp,
          price: item.price,
          storeId: storeId,
          variantId: item.variantId,
        };
      })
    );

    await tx.price.createMany({
      data: createPriceItemsData.map((item) => {
        return {
          id: BigInt(item.priceId),
          storeId: BigInt(item.storeId),
          mrp: item.mrp,
          price: item.price,
          variantId: BigInt(item.variantId),
          channelType: item.channelType,
        };
      }),
    });

    await tx.priceUpdate.createMany({
      data: createPriceItemsData.map((item) => {
        return {
          priceId: BigInt(item.priceId),
          storeId: BigInt(item.storeId),
          price: item.price,
          mrp: item.mrp,
          metadata: {
            triggered_by: "CREATE_PRICE",
          },
        };
      }),
    });

    return {
      inventory: createInventoryItemsData,
      price: createPriceItemsData,
    };
  });

  const uniqueItems = new Set([
    ...result.inventory.map((item) => `${item.variantId}_${item.channelType}`),
    ...result.price.map((item) => `${item.variantId}_${item.channelType}`),
  ]);

  const mergedData = Array.from(uniqueItems).map((item) => {
    const { inventoryId: iid, ...inventoryItem } = (result.inventory.find(
      (i) => `${i.variantId}_${i.channelType}` === item
    ) || {}) as {
      inventoryId: bigint;
      storeId: bigint;
      variantId: bigint;
      channelType: ChannelType;
      quantity: number;
    };

    const { priceId: pid, ...priceItem } = (result.price.find(
      (p) => `${p.variantId}_${p.channelType}` === item
    ) || {}) as {
      priceId: string;
      channelType: ChannelType;
      mrp: number;
      price: number;
      storeId: bigint;
      variantId: string;
    };

    return {
      inventoryId: iid,
      priceId: pid,
      ...inventoryItem,
      ...priceItem,
    };
  });

  return mergedData;
};

const updateAssets = async (
  updateAssetDto: UpdateAssetDto,
  isDefaultVariant?: boolean
) => {
  const { productAssets, variantAssets } = updateAssetDto;

  // Prepare all updates as rows for the VALUES clause
  const allUpdates = [
    ...variantAssets.flatMap((variantAsset) =>
      variantAsset.assets.map((asset) => ({
        id: BigInt(asset.assetId),
        productId: isDefaultVariant ? BigInt(productAssets.productId) : null,
        variantId: variantAsset.variantId
          ? BigInt(variantAsset.variantId)
          : null,
        position: asset.position || null,
      }))
    ),
  ];

  if (productAssets?.assets && !isDefaultVariant) {
    allUpdates.push(
      ...productAssets.assets.map((asset) => ({
        id: BigInt(asset.assetId),
        productId: productAssets.productId
          ? BigInt(productAssets.productId)
          : null,
        variantId: null,
        position: asset.position || null,
      }))
    );
  }

  if (allUpdates.length < 0) {
    return { message: "No updates to be performed on assets" };
  }

  // Build VALUES part of the query
  const valuesSql = allUpdates
    .map(
      (update) =>
        `(${update.id}, ${
          update.productId !== null ? `${update.productId}` : `NULL::BIGINT`
        }, ${
          update.variantId !== null ? `${update.variantId}` : `NULL::BIGINT`
        }, ${update.position !== null ? update.position : `NULL::INTEGER`})`
    )
    .join(", ");

  // Construct the SQL query
  const sql = `
    UPDATE "asset"
    SET
      "product_id" = COALESCE(data."product_id", "asset"."product_id"),
      "variant_id" = COALESCE(data."variant_id", "asset"."variant_id"),
      "position" = COALESCE(data."position", "asset"."position")
    FROM (
      VALUES ${valuesSql}
    ) AS data(id, "product_id", "variant_id", "position")
    WHERE "asset"."id" = data.id;
  `;

  // Execute the query within a transaction
  const res = await prisma.$transaction(async (tx) => {
    // Execute the query
    const result = await tx.$executeRawUnsafe(sql);
    return result;
  });

  return res;
};

// ==================================================
// End of Helper function
// ==================================================

// GET /api/products - Get all products (paginated)
export async function GET(request: NextRequest) {
  try {
    const authError = await requireAuth(request);
    if (authError) return unauthorizedResponse();

    const user = await getAuthUser(request);
    if (!user || !user.id) {
      return unauthorizedResponse();
    }

    const xStoreIdHeader = request.headers.get("x-store-id");

    if (!xStoreIdHeader) {
      return errorResponse("Store id is required", 400);
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams) as ProductListDto;

    const validationResult = await validateDto(ProductListDto, queryParams);

    if (!validationResult.success || !validationResult.data) {
      return errorResponse("Validation failed", 400, validationResult.errors);
    }

    const page = parseInt(String(queryParams.page ?? "1"), 10);
    const limit = Math.min(
      parseInt(String(queryParams.limit ?? "10"), 10),
      100
    );
    const orderBy = String(queryParams.orderBy || "createdAt");
    const sort = String(queryParams.sort || "desc");

    const skip = (page - 1) * limit;

    const storeIdBigInt = BigInt(xStoreIdHeader);

    // ===================================================================

    const [store, where] = await Promise.all([
      prisma.store.findUnique({
        where: { id: storeIdBigInt },
        select: { enabledChannels: true },
      }),
      buildProductWhereClause(storeIdBigInt, queryParams),
    ]);

    if (!store) {
      return notFoundResponse("Store not found");
    }

    const enabledChannels = new Set(store.enabledChannels);

    // Execute all database queries in parallel
    const [totalProducts, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: sort },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          hsnCode: true,
          storeId: true,
          subCategoryId: true,
          categoryId: true,
          inventoryStrategy: true,
          priceStrategy: true,
          originCountry: true,
          variants: {
            select: {
              id: true,
              sku: true,
              externalProductIdentifier: true,
              option: true,
              extraData: true,
              channels: true,
              assets: {
                where: { deletedAt: null },
                select: { id: true, position: true, uri: true },
              },
            },
          },
          assets: {
            where: { deletedAt: null },
            select: { id: true, position: true, uri: true },
          },
        },
      }),
    ]);

    // Process assets and variants in parallel
    const processedProducts = await processProducts(products, enabledChannels);

    // Fetch categories and external data in parallel
    const [categoryMap, externalData] = await Promise.all([
      fetchCategories(products),
      fetchExternalData(products, storeIdBigInt, enabledChannels),
      [],
    ]);

    // Build final response
    const data = processedProducts.map((product) => ({
      ...product,
      categoryName: categoryMap.get(product.categoryId)?.name || "",

      variants: product.variants.map((variant) => ({
        ...variant,
        channelData: externalData.get(String(variant.id)) || [],
        externalProductId: variant.externalProductIdentifier[0],
      })),

    }));

    const response: PaginatedResponse<ProductResponse, "products"> = {
      products: data,
      pagination: {
        page,
        limit,
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
      },
    };

    return successResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const authError = await requireAuth(request);
    if (authError) return unauthorizedResponse();

    const user = await getAuthUser(request);
    if (!user || !user.id) {
      return unauthorizedResponse();
    }

    const xStoreIdHeader = request.headers.get("x-store-id");

    if (!xStoreIdHeader) {
      return errorResponse("Store id is required", 400);
    }

    const storeIdBigInt = BigInt(xStoreIdHeader);

    const body: CreateProductDto = await request.json();

    const validationResult = await validateDto(CreateProductDto, body);
    if (!validationResult.success || !validationResult.data) {
      return errorResponse("Validation failed", 400, validationResult.errors);
    }

    const [{ next_id: productId }] = await prisma.$queryRaw<
      { next_id: bigint }[]
    >`
SELECT public.next_id() as next_id`;

    const storeData = await prisma.store.findUnique({
      where: {
        id: storeIdBigInt,
      },
    });

    if (!storeData) {
      return notFoundResponse("Store not found");
    }

    const category = await prisma.category.findUnique({
      where: {
        id: BigInt(body.categoryId),
      },
      select: {
        name: true,
        subCategory: true,
        active: true,
      },
    });

    if (!category) {
      return notFoundResponse("Category not found");
    }

    if (!category.active) {
      return errorResponse("Category is inactive");
    }

    const subCategory = await prisma.subCategory.findUnique({
      where: {
        id: BigInt(body.subCategoryId),
      },
      select: {
        id: true,
        name: true,
        active: true,
        metadata: true,
      },
    });

    if (!subCategory) {
      return notFoundResponse("Subcategory not found");
    }

    if (!subCategory.active) {
      return errorResponse("Product type is inactive");
    }

    if (!category.subCategory.some((item) => item.id === subCategory.id)) {
      return errorResponse(
        `${subCategory.name} does not belong to ${category.name} category`
      );
    }

    const createOfferPayload: Array<CreateOfferDto> = [];

    const updateAssetsPayload: UpdateAssetDto = {
      variantAssets: [],
      productAssets: {
        productId: String(productId),
        assets: body.productAssets,
      },
    };
    
    let firstSku: string;
    let channels: ChannelType[] = [];

    const createProductVariantData: {
      id: bigint;
      storeId: bigint;
      productId: bigint;
      sku: string;
      externalProductId?: ExternalProductIdTypeDto;
      option: object;
      extraData?: object;
      channels: ChannelType[];
    }[] = await Promise.all(
      body.variants.map(async (variant, index) => {
        const variantChannelData: {
          quantity: number;
          channelType: ChannelType;
          mrp?: number;
          price?: number;
        }[] = [];

        const [{ next_id: id }] = await prisma.$queryRaw<{ next_id: bigint }[]>`
  SELECT public.next_id() as next_id`;

        channels = variant.channelData.map((data) => {
          if (!storeData.enabledChannels.includes(data.channelType)) {
            throw new Error(`Store and variant doesn't have same channels`);
          }
          createOfferPayload.push({
            variantId: String(id),
            quantity: data.quantity,
            channelType: data.channelType,
            mrp: data.mrp || 0,
            price: data.price || 0,
          });

          variantChannelData.push({
            quantity: data.quantity,
            channelType: data.channelType,
            mrp: data.mrp,
            price: data.price,
          });

          return data.channelType;
        });

        updateAssetsPayload.variantAssets.push({
          variantId: String(id),
          assets:
            variant.option.type === VariantType.DEFAULT
              ? body.productAssets
              : variant.variantAssets,
        });

        let sku: string;
        if (variant.sku) {
          sku = variant.sku;
        } else {
          if (index == 0) {
            firstSku = generateSku(category.name, subCategory.name, index + 1);
            sku = firstSku;
          } else {
            const match = firstSku.split("-")[2].match(/^([a-zA-Z]+)(\d+)$/);
            if (!match) {
              throw new Error("Invalid firstSku format");
            }
            const suffix = match[1];

            sku = generateSku(
              category.name,
              subCategory.name,
              index + 1,
              suffix
            );
          }
        }

        return {
          id: id,
          storeId: storeIdBigInt,
          productId: productId,
          sku: sku,
          externalProductId: variant.externalProductId,
          option: variant.option as object,
          extraData: body.extraData,
          channels: channels,
        };
      })
    );

    await createOffer(createOfferPayload, storeIdBigInt);

    const createProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          id: productId,
          storeId: storeIdBigInt,
          title: body.title,
          description: body.description,
          slug: generateSlug(body.title),
          status: body.status,
          hsnCode: body.hsnCode,
          subCategoryId: BigInt(body.subCategoryId),
          categoryId: BigInt(body.categoryId),
          variationAttribute: body.variantionAttributes,
          originCountry: body.originCountry,
          priceStrategy: body.priceStrategy,
          inventoryStrategy: body.inventoryStrategy,
          productMeasurement: instanceToPlain(body.packageDetails.dimensions),
          manufacturingInfo: instanceToPlain(body.manufacturingInfo),
          brandName: body.brandName,
        },
      });

      await tx.variant.createMany({
        data: createProductVariantData.map((variant) => {
          return {
            id: variant.id,
            productId: variant.productId,
            storeId: variant.storeId,
            sku: variant.sku,
            option: variant.option,
            extraData: variant.extraData,
            channels: variant.channels,
          };
        }),
      });
  
      await tx.externalProductIdentifier.createMany({
        data: createProductVariantData.map((variant) => {
          return {
            storeId: variant.storeId,
            variantId: variant.id,
            type: String(variant.externalProductId?.type || '') as ExternalProductIdType,
            value: String(variant.externalProductId?.value || ''),
          };
        }),
      });

      return product;
    });

    // update assets of variant and product both
    await updateAssets(
      updateAssetsPayload,
      body.variants[0]?.option?.type === VariantType.DEFAULT
    );

    return successResponse(createProduct, "Product created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
