import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "@/lib/mock-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET(request, { params }) {
  const { queueid } = params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.redirect('/auth/signin');
  }

  try {
    // Redirect to the join queue page with a quick-join flag
    return NextResponse.redirect(`/user/queue/${queueid}?quick_join=true`);
  } catch (error) {
    console.error('Error in quick join:', error);
    return NextResponse.redirect(`/user/queue/${queueid}`);
  }
} 