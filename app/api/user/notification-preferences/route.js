import { NextResponse } from 'next/server';
import { getServerSession } from "@/lib/mock-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('user_notification_preferences')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || {
    email_enabled: true,
    sms_enabled: true,
    whatsapp_enabled: false
  });
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const preferences = await request.json();
  const { error } = await supabase
    .from('user_notification_preferences')
    .upsert({
      user_id: session.user.id,
      ...preferences,
      updated_at: new Date().toISOString()
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 