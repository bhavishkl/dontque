import { NextResponse } from 'next/server';

export async function POST() {
  // Logout is handled by NextAuth on the client side usually, or by redirecting to /api/auth/signout
  // But if a custom logout endpoint is needed, it should probably just return success or redirect.
  // Since we are no longer using the `user_data` cookie, we don't need to manually clear it here.
  // NextAuth handles its own session cookie clearing.

  return NextResponse.json({ success: true });
}
