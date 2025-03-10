import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const isAuthenticated = Boolean(req.cookies.get("token"));
  const isLoginPath = pathname === "/login" || pathname === "/register";
  if(pathname === "/verify-email")
    return NextResponse.next();

  if(!isAuthenticated && !isLoginPath)
    return NextResponse.redirect(new URL("/login", req.url));
  
  if(isAuthenticated && isLoginPath)
    return NextResponse.redirect(new URL("/dashboard", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/settings", "/dashboard", "/transfer", "/login", "/register", "/verify-email"],
};
