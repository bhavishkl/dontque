import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { queueid } = params;
  const { shortId } = await request.json();

  try {
    // Fetch the user by short_id
    const { data: userData, error: userError } = await supabase
      .from('user_profile')
      .select('user_id, name')
      .eq('user_short_id', shortId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the current queue information
    const { data: queueData, error: queueError } = await supabase
      .from('queues')
      .select('current_queue, max_capacity, avg_wait_time')
      .eq('queue_id', queueid)
      .single();

    if (queueError) {
      return NextResponse.json({ error: queueError.message }, { status: 500 });
    }

    if (queueData.current_queue >= queueData.max_capacity) {
      return NextResponse.json({ error: 'Queue is full' }, { status: 400 });
    }

    // Check if the user is already in the queue
    const { data: existingEntry, error: existingEntryError } = await supabase
      .from('queue_entries')
      .select('entry_id')
      .eq('queue_id', queueid)
      .eq('user_id', userData.user_id)
      .eq('status', 'waiting')
      .single();

    if (existingEntryError && existingEntryError.code !== 'PGRST116') {
      return NextResponse.json({ error: existingEntryError.message }, { status: 500 });
    }

    if (existingEntry) {
      return NextResponse.json({ error: 'User is already in the queue' }, { status: 400 });
    }

    // Add the user to the queue
    const { data: newEntry, error: insertError } = await supabase
      .from('queue_entries')
      .insert({
        queue_id: queueid,
        user_id: userData.user_id,
        position: queueData.current_queue + 1,
        status: 'waiting',
        estimated_wait_time: queueData.avg_wait_time,
        added_by: session.user.id
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Update the queue count
    const { error: updateError } = await supabase
      .from('queues')
      .update({ current_queue: queueData.current_queue + 1 })
      .eq('queue_id', queueid);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update the known_users in the user_profile of the session user
    const { data: profileData, error: profileError } = await supabase
      .from('user_profile')
      .select('known_users')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    } else {
      const knownUsers = profileData.known_users || [];
      const updatedKnownUsers = [...knownUsers, { shortId, name: userData.name }];

      const { error: updateProfileError } = await supabase
        .from('user_profile')
        .update({ known_users: updatedKnownUsers })
        .eq('user_id', session.user.id);

      if (updateProfileError) {
        console.error('Error updating known users:', updateProfileError);
      }
    }

    return NextResponse.json({ 
      message: 'User added to queue successfully', 
      entry: newEntry,
      name: userData.name
    });
  } catch (error) {
    console.error('Error adding known user to queue:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}