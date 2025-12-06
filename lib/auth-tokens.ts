import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "@/lib/env";

type JwtPayload = {
  sub: string;
  email: string;
  type: "access" | "refresh";
};

const JWT_ACCESS_SECRET = env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES_IN = env.JWT_ACCESS_EXPIRES_IN;
const REFRESH_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN;

export function signAccessToken(userId: string, email: string): string {
  return jwt.sign(
    { sub: userId, email, type: "access" } satisfies JwtPayload,
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN } as SignOptions
  );
}

export function signRefreshToken(userId: string, email: string): string {
  return jwt.sign(
    { sub: userId, email, type: "refresh" } satisfies JwtPayload,
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN } as SignOptions
  );
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
  if (decoded.type !== "access") {
    throw new Error("Invalid token type");
  }
  return decoded;
}

export function verifyRefreshToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  if (decoded.type !== "refresh") {
    throw new Error("Invalid token type");
  }
  return decoded;
}


