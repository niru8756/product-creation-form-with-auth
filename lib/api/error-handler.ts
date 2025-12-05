import { NextResponse } from "next/server";
import { errorResponse, serverErrorResponse } from "./response";
import { ValidationError } from "./validation";
import { Prisma } from "@prisma/client";

export function handleApiError(error: unknown): NextResponse {
  // Handle validation errors
  if (error instanceof ValidationError) {
    return errorResponse(error.message, 400);
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return errorResponse("A record with this value already exists", 409);
    }
    if (error.code === "P2025") {
      return errorResponse("Record not found", 404);
    }
    return errorResponse("Database error occurred", 500);
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return errorResponse("Invalid data provided", 400);
  }

  // Handle generic errors
  if (error instanceof Error) {
    console.error("API Error:", error);
    return errorResponse(error.message || "An error occurred", 500);
  }

  // Handle unknown errors
  console.error("Unknown API Error:", error);
  return serverErrorResponse();
}

