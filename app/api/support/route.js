import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/mock-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subject, message } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // Get user role from user_profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profile')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) throw profileError;
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: session.user.id,
        user_role: userProfile.role || 'user', // Fallback to 'user'
        subject: subject.substring(0, 255), // Ensure subject length limit
        message
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Support ticket error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create support ticket' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if user is admin
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profile')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) throw profileError;
    if (userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all tickets with user info
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user_profile:user_id (name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tickets: ' + error.message },
      { status: 500 }
    );
  }
}