import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  // Verify the NextAuth session token
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  if (token) {
    const { role } = token;

    if (role === 'business' && !request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else if (role === 'user' && !request.nextUrl.pathname.startsWith('/user/home')) {
      return NextResponse.redirect(new URL('/user/home', request.url));
    }
  } else {
      // If no token and trying to access protected routes, redirect to home or signin
      // (This logic depends on what pages are protected. The previous middleware only checked for the cookie if it existed)
      // If the intention is to protect dashboard/user routes:
      const path = request.nextUrl.pathname;
      if (path.startsWith('/dashboard') || path.startsWith('/user')) {
           return NextResponse.redirect(new URL('/signin', request.url));
      }
  }

  return NextResponse.next();
}

// Apply middleware to specific paths
export const config = {
  matcher: ['/', '/dashboard/:path*', '/user/:path*'], // Added protected routes to matcher
};
