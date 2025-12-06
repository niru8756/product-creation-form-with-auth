import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse, unauthorizedResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { requireAuth, getAuthUser } from "@/lib/api/middleware";
import { validateDto } from "@/lib/api/validation";
import { ExternalProductIdentifierDto } from "@/types/dto/external-product-identifier.dto";

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

    const storeIdBigInt = BigInt(xStoreIdHeader);

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams) as unknown as ExternalProductIdentifierDto;

    const validationResult = await validateDto(ExternalProductIdentifierDto, queryParams);

    if (!validationResult.success || !validationResult.data) {
      return errorResponse("Validation failed", 400, validationResult.errors);
    }

    const externalProductIdentifier =
      await prisma.externalProductIdentifier.findUnique({
        where: {
          storeId_type_value: {
            storeId: BigInt(storeIdBigInt),
            type: queryParams.type,
            value: queryParams.value,
          },
        },
      });

    if (!externalProductIdentifier) {
      return successResponse(
        null,
        "No external product identifier was found for the provided value."
      );
    }

    return successResponse(
      {
        type: externalProductIdentifier.type,
        value: externalProductIdentifier.value,
      },
      `This ${externalProductIdentifier.type} (${externalProductIdentifier.value}) is already used.`
    );
  } catch (error) {
    return handleApiError(error);
  }
}
