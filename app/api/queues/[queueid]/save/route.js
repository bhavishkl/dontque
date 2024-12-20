import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { queueid } = params;

    // First try to find the queue by short_id, then by queue_id
    let { data: queue, error: queueError } = await supabase
      .from('queues')
      .select('queue_id')
      .eq('short_id', queueid)
      .single();

    if (queueError) {
      // If not found by short_id, try queue_id
      const { data: queueById, error: queueByIdError } = await supabase
        .from('queues')
        .select('queue_id')
        .eq('queue_id', queueid)
        .single();

      if (queueByIdError) {
        console.error('Error fetching queue:', queueByIdError);
        return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
      }
      queue = queueById;
    }

    if (!queue) {
      return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
    }

    // Check if queue is already saved
    const { data: existingSave, error: checkError } = await supabase
      .from('saved_queues')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('queue_id', queue.queue_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking saved status:', checkError);
      return NextResponse.json({ error: 'Failed to check saved status' }, { status: 500 });
    }

    if (existingSave) {
      const { error: deleteError } = await supabase
        .from('saved_queues')
        .delete()
        .eq('user_id', session.user.id)
        .eq('queue_id', queue.queue_id);

      if (deleteError) {
        console.error('Error deleting save:', deleteError);
        return NextResponse.json({ error: 'Failed to unsave queue' }, { status: 500 });
      }

      return NextResponse.json({ saved: false });
    } else {
      const { error: insertError } = await supabase
        .from('saved_queues')
        .insert({
          user_id: session.user.id,
          queue_id: queue.queue_id
        });

      if (insertError) {
        console.error('Error saving queue:', insertError);
        return NextResponse.json({ error: 'Failed to save queue' }, { status: 500 });
      }

      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error('Error toggling save status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { queueid } = params;

    // First try to find the queue by short_id, then by queue_id
    let { data: queue, error: queueError } = await supabase
      .from('queues')
      .select('queue_id')
      .eq('short_id', queueid)
      .single();

    if (queueError) {
      // If not found by short_id, try queue_id
      const { data: queueById, error: queueByIdError } = await supabase
        .from('queues')
        .select('queue_id')
        .eq('queue_id', queueid)
        .single();

      if (queueByIdError) {
        console.error('Error fetching queue:', queueByIdError);
        return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
      }
      queue = queueById;
    }

    if (!queue) {
      return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('saved_queues')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('queue_id', queue.queue_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking save status:', error);
      return NextResponse.json({ error: 'Failed to check save status' }, { status: 500 });
    }

    return NextResponse.json({ saved: !!data });
  } catch (error) {
    console.error('Error checking save status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 