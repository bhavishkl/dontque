import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "@/lib/mock-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET() {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { data: business, error } = await supabase
      .from('business_info')
      .select(`
        business_id,
        name,
        business_type,
        category,
        description,
        address,
        city,
        pincode,
        phone,
        email,
        gst_number,
        pan_number,
        fssai_number,
        status,
        created_at,
        updated_at
      `)
      .eq('owner_id', session.user.id)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error fetching business profile:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to fetch business profile',
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: business || null
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch business profile',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const userId = session.user.id;

    // Create business profile
    const { data: business, error: businessError } = await supabase
      .from('business_info')
      .insert({
        owner_id: userId,
        name: data.name,
        business_type: data.businessType,
        category: data.category,
        description: data.description,
        address: data.address,
        city: data.city,
        pincode: data.pincode,
        phone: data.phone,
        email: data.email,
        gst_number: data.gst,
        pan_number: data.pan,
        fssai_number: data.fssai,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (businessError) {
      console.error('Business creation error:', businessError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to create business profile',
        error: businessError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding completed successfully',
      businessId: business.business_id
    });
    
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process onboarding data',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
