import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { supabase } from '@/app/lib/supabase';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

export async function GET(request) {
  try {
    // Retrieve the authenticated session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use a query parameter "userId" if provided, otherwise use the session's user id
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    // Fetch the user profile data from the user_profile table
    const { data, error } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Create/update the user data cookie
    const cookieStore = cookies();
    const userData = {
      userId: data.user_id,
      name: data.name,
      email: session.user.email,
      role: data.role,
      lastUpdated: new Date().toISOString()
    };
    
    // Create a signed cookie value
    const secret = new TextEncoder().encode(process.env.COOKIE_SECRET);
    const signedValue = await new SignJWT(userData)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret);

    // Set the cookie with the signed JWT
    cookieStore.set('user_data', signedValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Set-Cookie': cookieStore.toString(),
          'Cache-Control': 'public, max-age=60', 
        },
      }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// PATCH method to update the user's name
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      );
    }

    // Update the user profile name in the user_profile table
    const { data, error } = await supabase
      .from('user_profile')
      .update({ name: name.trim() })
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error updating user name:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Update the user data cookie
    const cookieStore = cookies();
    const userData = {
      userId: session.user.id,
      name: name.trim(),
      email: session.user.email,
      role: data.role,
      lastUpdated: new Date().toISOString()
    };
    
    // Create a signed cookie value
    const secret = new TextEncoder().encode(process.env.COOKIE_SECRET);
    const signedValue = await new SignJWT(userData)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret);

    // Set the cookie with the signed JWT
    cookieStore.set('user_data', signedValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Set-Cookie': cookieStore.toString(),
        },
      }
    );
  } catch (err) {
    console.error('Unexpected error during update:', err);
    return NextResponse.json(
      { error: 'Failed to update user name' },
      { status: 500 }
    );
  }
} 