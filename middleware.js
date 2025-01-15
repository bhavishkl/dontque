import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request) {
  // Only run middleware on the landing page
  if (request.nextUrl.pathname !== '/') return NextResponse.next()

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  // If user is authenticated, redirect based on their role
  if (token) {
    const redirectUrl = token.role === 'business' 
      ? new URL('/dashboard', request.url)
      : new URL('/user/home', request.url)
    
    return NextResponse.redirect(redirectUrl)
  }

  // Allow unauthenticated users to see the landing page
  return NextResponse.next()
}

export const config = {
  matcher: '/'  // Only run on landing page
} 