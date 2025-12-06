import { NextRequest } from "next/server";
import { unauthorizedResponse } from "./response";
import { verifyAccessToken } from "@/lib/auth-tokens";

export type AuthUser = {
  id: string;
  email: string;
};

export async function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return unauthorizedResponse();
  }

  const token = authHeader.split(" ")[1];

  try {
    verifyAccessToken(token);
    return null;
  } catch {
    return unauthorizedResponse();
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}


