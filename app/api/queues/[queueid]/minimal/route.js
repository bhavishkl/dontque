import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "@/lib/mock-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET(request, { params }) {
  try {
    const { queueid } = params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: queueData, error: queueError } = await supabase
      .from('queues')
      .select('queue_id, service_type')
      .eq('queue_id', queueid)
      .single();

    if (queueError) {
      console.error('Error fetching queue data:', queueError);
      return NextResponse.json({ error: queueError.message }, { status: 500 });
    }

    return NextResponse.json(queueData);
  } catch (error) {
    console.error('Unexpected error in GET function:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}