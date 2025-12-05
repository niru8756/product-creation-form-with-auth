import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/auth-tokens";

type RefreshRequest = {
  refreshToken: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RefreshRequest;
    const { refreshToken } = body;

    if (!refreshToken) {
      return errorResponse("Refresh token is required", 400);
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      return errorResponse("Invalid or expired refresh token", 401);
    }

    const payload = verifyRefreshToken(refreshToken);

    if (!stored.user || String(stored.user.id) !== payload.sub) {
      return errorResponse("Invalid refresh token", 401);
    }

    const newAccessToken = signAccessToken(String(stored.user.id), stored.user.email);
    const newRefreshToken = signRefreshToken(String(stored.user.id), stored.user.email);

    // Revoke old and store new refresh token (rotation)
    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revoked: true },
      }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: stored.user.id,
          expiresAt: new Date(
            (JSON.parse(
              Buffer.from(newRefreshToken.split(".")[1], "base64").toString("utf8")
            ) as { exp: number }).exp * 1000
          ),
        },
      }),
    ]);

    return successResponse({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return handleApiError(error);
  }
}


