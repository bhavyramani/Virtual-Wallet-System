import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const isAuthenticated = Boolean(req.cookies.get('token')); 
  
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.next(); 
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next(); 
}

export const config = {
  matcher: ['/', '/settings', '/dashboard', '/transfer'],
};
