import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from '@/lib/mock-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const url = new URL(request.url);
    // Get pagination query parameters
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    // Query aggregated feedback (from the SQL view "feedback_aggregates")
    const { data: aggregates, error: aggError } = await supabase
      .from('feedback_aggregates')
      .select('*')
      .maybeSingle();
    if (aggError) throw aggError;

    // Query the feedback table with pagination and get a total count
    const { data: feedback, error: fbError, count } = await supabase
      .from('app_feedback')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (fbError) throw fbError;

    return NextResponse.json(
      {
        aggregates,
        feedback,
        page,
        limit,
        total: count,  // total records in app_feedback for pagination calculation
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: 'Invalid rating value' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('app_feedback')
      .insert({
        user_id: session.user.id,
        rating: body.rating,
        feedback_text: body.feedback_text,
        user_role: body.user_role,
        user_name: body.user_name,
        user_image: body.user_image
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 