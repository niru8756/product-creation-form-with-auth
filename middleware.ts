import { NextRequest, NextResponse } from "next/server";

const publicAuthPages = ["/auth/login", "/auth/register"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("ppppppppppp....... ", pathname)
  const isPublicAuthPage = publicAuthPages.includes(pathname);
  
  // Check for NextAuth session cookie
  const sessionToken = request.cookies.get("next-auth.session-token")?.value || 
                      request.cookies.get("__Secure-next-auth.session-token")?.value;
  const isAuthenticated = !!sessionToken;

  // --- 1. If NOT logged in and visiting public pages (login/register) → allow
  if (!isAuthenticated && isPublicAuthPage) {
    return NextResponse.next();
  }

  // --- 2. If NOT logged in and trying to visit ANY protected route → redirect to /auth/register
  if (!isAuthenticated && !isPublicAuthPage) {
    return NextResponse.redirect(new URL("/auth/register", request.url));
  }

  // --- 3. If LOGGED IN and visiting login/register → redirect to dashboard
  if (isAuthenticated && isPublicAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // --- 4. If LOGGED IN and accessing protected pages → allow
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$).*)',
  ],
};