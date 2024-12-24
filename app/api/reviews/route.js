import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Get reviews for a queue
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const queueId = searchParams.get('queueId');
  
  try {
    const { data, error } = await supabase
      .from('user_ratings')
      .select(`
        *,
        user_profile:user_id (
          name,
          image
        )
      `)
      .eq('queue_id', queueId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new review
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Update archive entry review status
    await supabase
      .from('queue_entries_archive')
      .update({ review_status: 'completed' })
      .eq('id', body.archiveId)
      .eq('user_id', session.user.id);

    const { data, error } = await supabase
      .from('user_ratings')
      .insert({
        user_id: session.user.id,
        queue_id: body.queueId,
        rating: body.rating,
        review_title: body.title,
        review_text: body.text,
        wait_time_rating: body.waitTimeRating,
        service_rating: body.serviceRating,
        ambiance_rating: body.ambianceRating,
        visit_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 