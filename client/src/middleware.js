// middleware.js
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Skip the middleware for /login and /register
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.next(); 
  }

  const isAuthenticated = Boolean(req.cookies.get('token')); 

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next(); 
}

export const config = {
  matcher: ['/', '/settings', '/dashboard', '/transfer'],
};
