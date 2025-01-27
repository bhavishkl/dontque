import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Public paths that don't require authentication
    const publicPaths = ['/', '/signin', '/signup'];
    if (publicPaths.includes(path)) {
      // If user is already logged in, redirect to appropriate dashboard
      if (token) {
        const role = token.role || 'user';
        if (role === 'business') {
          return NextResponse.redirect(new URL('/dashboard/business', req.url));
        } else {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      }
      return NextResponse.next();
    }

    if (path.startsWith('/dashboard/business') && token?.role !== 'business') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

// Configure which routes to protect
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/signin',
    '/signup'
  ]
};
