import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const cookieStore = cookies();
  const userDataCookie = cookieStore.get('user_data');
  
  if (userDataCookie) {
    try {
      // Ensure COOKIE_SECRET is defined
      if (!process.env.COOKIE_SECRET) {
        throw new Error('COOKIE_SECRET is not defined. Please check your .env.local file and ensure it is loaded correctly.');
      }

      // Verify the JWT
      const secret = new TextEncoder().encode(process.env.COOKIE_SECRET);
      const { payload } = await jwtVerify(userDataCookie.value, secret);

      // Role-based redirection
      if (payload.role === 'business' && !request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else if (payload.role === 'user' && !request.nextUrl.pathname.startsWith('/user/home')) {
        return NextResponse.redirect(new URL('/user/home', request.url));
      }
    } catch (error) {
      console.error('JWT verification error:', error.message);
      
      // Clear invalid cookie
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('user_data', {
        path: '/',
      });
      
      return response;
    }
  }

  return NextResponse.next();
}

// Apply middleware to specific paths
export const config = {
  matcher: '/', // Only run middleware on the landing page
}; 