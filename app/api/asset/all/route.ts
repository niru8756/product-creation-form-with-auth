import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { requireAuth, getAuthUser } from "@/lib/api/middleware";
import { validateDto } from "@/lib/api/validation";
import { GetAssetsDto } from "@/types/dto/asset.dto";
import { getFileUrl } from "@/lib/api/aws-s3";
import { JsonValue } from "@prisma/client/runtime/client";

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

    const reqBody: GetAssetsDto = await request.json();

    const validationResult = await validateDto(GetAssetsDto, reqBody);
    if (!validationResult.success || !validationResult.data) {
      return errorResponse("Validation failed", 400, validationResult.errors);
    }

    const result: Array<{
      id: bigint;
      metadata: JsonValue;
      position: number;
      uri: string;
      assetUrl: string;
    }> = [];

    await Promise.all(
      reqBody.assetIds.map(async (assetId) => {
        const assetData = await prisma.asset.findUnique({
          where: {
            id: BigInt(assetId),
            storeId: BigInt(storeIdBigInt),
            deletedAt: null,
          },
          select: {
            id: true,
            position: true,
            uri: true,
            metadata: true,
          },
        });

        if (assetData) {
          result.push({
            ...assetData,
            assetUrl: await getFileUrl(assetData.uri),
          });
        }
      })
    );

    return successResponse(result, "Assets fetched successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
