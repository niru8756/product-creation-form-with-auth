import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { signAccessToken, signRefreshToken } from "@/lib/auth-tokens";
import bcrypt from "bcryptjs";
import { plainToInstance } from "class-transformer";
import { LoginDto } from "@/types/dto/login.dto";
import { validate } from "class-validator";
import { formatValidationErrors } from "@/lib/api/format-validation-errors";

type LoginRequest = {
  email: string;
  password: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginRequest;

    const dto = plainToInstance(LoginDto, body);

    const errors = await validate(dto);
    if (errors.length > 0) {
      return errorResponse(
        "Validation failed",
        400,
        formatValidationErrors(errors)
      );
    }

    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return errorResponse("Invalid email or password", 401);
    }

    const accessToken = signAccessToken(String(user.id), user.email);
    const refreshToken = signRefreshToken(String(user.id), user.email);

    // Store refresh token
    const decodedRefresh = JSON.parse(
      Buffer.from(refreshToken.split(".")[1], "base64").toString("utf8")
    ) as { exp: number };

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(decodedRefresh.exp * 1000),
      },
    });

    const store = await prisma.store.findUnique({
      where: { userId: user.id },
    });

    return successResponse(
      {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        storeId: store?.id,
      },
      "Login successful"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
