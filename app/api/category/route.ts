import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse, unauthorizedResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { requireAuth, getAuthUser } from "@/lib/api/middleware";

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

    const categories = await prisma.category.findMany({
      where: {
        active: true,
        OR: [{ storeId: BigInt(storeIdBigInt) }, { storeId: null }],
      },
      select: {
        id: true,
        name: true,
        subCategory: {
          where: {
            active: true,
          },
          select: {
            id: true,
            name: true,
            metadata: true,
          },
          orderBy: [{ name: "asc" }, { createdAt: "desc" }],
        },
      },
      orderBy: [{ name: "asc" }, { createdAt: "desc" }],
    });

    const transformedData = categories.map(({ subCategory, ...category }) => ({
      ...category,
      subCategories: subCategory,
    }));

    return successResponse(transformedData, "Categories fetched successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
