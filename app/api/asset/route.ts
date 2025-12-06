import { getFileUrl } from "@/lib/api/aws-s3";
import { handleApiError } from "@/lib/api/error-handler";
import { getAuthUser, requireAuth } from "@/lib/api/middleware";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from "@/lib/api/response";
import { validateDto } from "@/lib/api/validation";
import { prisma } from "@/lib/prisma";
import {
  CreateAssetDto,
  DeleteAssetDto,
  UpdateAssetDto,
} from "@/types/dto/asset.dto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authError = await requireAuth(req);
    if (authError) return unauthorizedResponse();

    const user = await getAuthUser(req);
    if (!user || !user.id) {
      return unauthorizedResponse();
    }

    const storeId = req.headers.get("x-store-id");
    if (!storeId) {
      return errorResponse("Store id is required", 400);
    }

    const reqBody: CreateAssetDto = await req.json();

    const validationResult = await validateDto(CreateAssetDto, reqBody);
    if (!validationResult.success || !validationResult.data) {
      return errorResponse("Validation failed", 400, validationResult.errors);
    }

    const { assets } = await req.json();
    const createAsset = await prisma.$transaction(async (tx) => {
      const assetsData = [];
      const response = [];

      for (const asset of assets) {
        const [{ next_id: assetId }] = await tx.$queryRaw<
          { next_id: bigint }[]
        >`
          SELECT public.next_id() as next_id`;

        const extension = asset.mimeType.split("/")[1];
        const key = `store/${storeId}/assets/${assetId}.${extension}`;
        const bucketName = process.env.S3_BUCKET_NAME;
        const uri = `s3://${bucketName}/${key}`;
        const metadata = {
          fileName: asset.fileName,
          fileSize: asset.fileSize,
          mimeType: asset.mimeType,
        };

        const signedUrl = await getFileUrl(key);

        // Prepare data for batch insertion
        assetsData.push({
          id: assetId,
          storeId: BigInt(storeId),
          type: asset.fileType,
          position: asset.position,
          uri: uri,
          metadata: metadata,
        });

        // Save signed URL for response
        response.push({
          id: assetId.toString(),
          fileName: asset.fileName,
          signedUrl: signedUrl,
        });
      }

      // Batch-insert assets into the database
      await tx.asset.createMany({ data: assetsData });

      return response;
    });

    return NextResponse.json(createAsset);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authError = await requireAuth(req);
    if (authError) return unauthorizedResponse();

    const user = await getAuthUser(req);
    if (!user || !user.id) {
      return unauthorizedResponse();
    }

    const storeId = req.headers.get("x-store-id");
    if (!storeId) {
      return errorResponse("Store id is required", 400);
    }

    const reqBody: UpdateAssetDto = await req.json();

    const validationResult = await validateDto(UpdateAssetDto, reqBody);
    if (!validationResult.success || !validationResult.data) {
      return errorResponse("Validation failed", 400, validationResult.errors);
    }

    const body = await req.json();
    const { productAssets, variantAssets } = body;
    const isDefaultVariant = false; // Assuming default false as per original service signature

    // Prepare all updates as rows for the VALUES clause
    const allUpdates = [
      ...(variantAssets || []).flatMap((variantAsset: any) =>
        variantAsset.assets.map((asset: any) => ({
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
        ...productAssets.assets.map((asset: any) => ({
          id: BigInt(asset.assetId),
          productId: productAssets.productId
            ? BigInt(productAssets.productId)
            : null,
          variantId: null,
          position: asset.position || null,
        }))
      );
    }

    if (allUpdates.length > 0) {
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
      return successResponse(res, "Updates performed successfully");
    } else {
      return successResponse(0, "No updates to be performed on assets");
    }
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE: Delete Assets
export async function DELETE(req: NextRequest) {
  try {
    const authError = await requireAuth(req);
    if (authError) return unauthorizedResponse();

    const user = await getAuthUser(req);
    if (!user || !user.id) {
      return unauthorizedResponse();
    }

    const storeId = req.headers.get("x-store-id");
    if (!storeId) {
      return errorResponse("Store id is required", 400);
    }

    const reqBody: DeleteAssetDto = await req.json();

    const validationResult = await validateDto(DeleteAssetDto, reqBody);
    if (!validationResult.success || !validationResult.data) {
      return errorResponse("Validation failed", 400, validationResult.errors);
    }

    const body = await req.json();
    const { assetIds } = body;

    if (assetIds && assetIds.length > 0) {
      // Build the SQL query to update the deletedAt column
      const sql = `
      UPDATE "asset"
      SET "deleted_at" = NOW()
      WHERE "id" IN (${assetIds
        .map((id: string) => `${BigInt(id)}`)
        .join(", ")})
      AND "store_id" = ${BigInt(storeId)};
    `;

      // Execute the query within a transaction
      const deleteResult = await prisma.$transaction(async (tx) => {
        // Execute the raw SQL query
        await tx.$executeRawUnsafe(sql);
      });

      return successResponse(deleteResult, "Assets deleted successfully");
    } else {
      return successResponse(0, "No assets to be deleted");
    }
  } catch (error) {
    return handleApiError(error);
  }
}
