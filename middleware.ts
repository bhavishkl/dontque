import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // If user is on landing page and is authenticated
  if (pathname === '/' && token) {
    try {
      // Get user role from database
      const { data: userData, error } = await supabase
        .from('user_profile')
        .select('role')
        .eq('user_id', token.id)
        .single()

      if (error) throw error

      const userRole = userData?.role || 'user'

      // Redirect based on role
      if (userRole === 'business') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/user/home', request.url))
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
      // Default to user home if there's an error
      return NextResponse.redirect(new URL('/user/home', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/'
}