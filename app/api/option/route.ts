import { getAuthUser, requireAuth } from "@/lib/api/middleware";
import { errorResponse, unauthorizedResponse } from "@/lib/api/response";
import { validateDto } from "@/lib/api/validation";
import { NextRequest, NextResponse } from "next/server";
import { CreateOptionDto } from "@/types/dto/create-option.dto";
import { prisma } from "@/lib/prisma";
import { customAlphabet } from "nanoid";
import { handleApiError } from "@/lib/api/error-handler";

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

    const reqBody: CreateOptionDto = await req.json();

    const validationResult = await validateDto(CreateOptionDto, reqBody);
    if (!validationResult.success || !validationResult.data) {
      return errorResponse("Validation failed", 400, validationResult.errors);
    }

    const body = await req.json();
    const { subCategory, attributeName, gender, brand, value } = body;

    const genderValue = gender ? gender : "N/A";
    const brandValue = brand ? brand : "default";

    const ptype = await prisma.subCategory.findFirst({
      where: {
        name: subCategory,
        active: true,
        OR: [{ storeId: null }, { storeId: BigInt(storeId) }],
      },
      select: {
        attributes: true,
        storeId: true,
      },
    });

    if (!ptype) {
      return NextResponse.json(
        { message: "Sub Category not found or inactive" },
        { status: 400 }
      );
    }

    const attr = new Set(ptype.attributes as string[]);

    if (!attr.has(attributeName)) {
      return NextResponse.json(
        { message: `No attribute found for ${attributeName}` },
        { status: 400 }
      );
    }

    const variantOptionOnSubCategory =
      await prisma.variantOptionOnSubCategory.findFirst({
        //@ts-ignore
        relationLoadStrategy: "join",
        where: {
          OR: [{ storeId: null }, { storeId: BigInt(storeId) }],
          typeName: subCategory,
          variantOption: {
            OR: [{ storeId: null }, { storeId: BigInt(storeId) }],
            brand: brandValue,
            gender: genderValue,
            attributeName: attributeName,
          },
        },
        include: {
          variantOption: true,
        },
      });

    const variantOption = variantOptionOnSubCategory
      ? variantOptionOnSubCategory.variantOption
      : null;

    let result;

    const alphabet: string =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    if (variantOption) {
      // Update variant values if exists
      if (!variantOption.editable) {
        return NextResponse.json(
          { message: "Options value not editable" },
          { status: 400 }
        );
      }

      const existingValues = variantOption.values as Array<any>;
      const updatedValues = [
        ...existingValues,
        { id: customAlphabet(alphabet, 16), ...value },
      ];

      result = await prisma.variantOption.update({
        where: { id: variantOption.id },
        data: { values: updatedValues },
      });

      // TODO: Add Audit Log (Kafka)
    } else {
      const newValues = [
        { id: customAlphabet(alphabet, 16), ...value },
      ] as Array<any>;

      const relationStoreId =
        ptype.storeId === null ? null : BigInt(ptype.storeId);

      result = await prisma.variantOption.create({
        data: {
          storeId: BigInt(storeId),
          name: attributeName.charAt(0).toUpperCase() + attributeName.slice(1),
          brand: brandValue,
          gender: genderValue,
          attributeName: attributeName,
          values: newValues,
          editable: true,
          subCategory: {
            create: {
              typeName: subCategory,
              storeId: relationStoreId,
            },
          },
        },
      });

      // TODO: Add Audit Log (Kafka)
    }

    return NextResponse.json({
      message: variantOption ? "Option updated" : "Option created",
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // findOne logic
      const result = await prisma.variantOption.findUnique({
        where: {
          id: BigInt(id),
        },
      });

      if (!result) {
        return NextResponse.json(
          { message: "Option not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "Option fetched successfully",
        data: result,
        source: "db",
      });
    } else {
      // findAll logic
      const result = await prisma.variantOption.findMany({
        where: {
          OR: [{ storeId: null }, { storeId: BigInt(storeId) }],
        },
      });

      return NextResponse.json({
        message: "Options fetched successfully",
        data: result,
        source: "db",
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
