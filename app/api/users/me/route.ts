import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getAuthUser, requireAuth } from "@/lib/api/middleware";

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAuth(request);
    if (authError) return authError;

    const user = await getAuthUser(request);
    if (!user || !user.id) {
      return notFoundResponse("User not found");
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: BigInt(user.id) },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!dbUser) {
      return notFoundResponse("User not found");
    }

    return successResponse(dbUser);
  } catch (error) {
    return handleApiError(error);
  }
}

