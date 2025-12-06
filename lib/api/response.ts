import { NextResponse } from "next/server";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      statusCode: status,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  status: number = 400,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      statusCode: status,
      message,
      error
    },
    { status }
  );
}

export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return errorResponse("Unauthorized", 401);
}

export function forbiddenResponse(): NextResponse<ApiResponse> {
  return errorResponse("Forbidden", 403);
}

export function notFoundResponse(
  message: string = "Resource not found"
): NextResponse<ApiResponse> {
  return errorResponse(message, 404);
}

export function serverErrorResponse(
  message: string = "Internal server error"
): NextResponse<ApiResponse> {
  return errorResponse(message, 500);
}
