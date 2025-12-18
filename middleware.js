import { NextResponse } from 'next/server';

export function middleware(request) {
  return NextResponse.next();
}

export const config = {
  matcher: [], // Empty matcher effectively disables it, but keeping it simple.
};