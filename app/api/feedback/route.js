import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  return NextResponse.json({ message: 'Feedback API endpoint' });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('app_feedback')
      .insert({
        user_id: session.user.id,
        user_type: body.userType,
        overall_rating: body.overallRating,
        ease_of_use_rating: body.easeOfUseRating,
        feature_satisfaction_rating: body.featureSatisfactionRating,
        ui_rating: body.uiRating,
        liked_features: body.likedFeatures,
        improvement_suggestions: body.improvementSuggestions,
        bug_report: body.bugReport,
        feature_requests: body.featureRequests,
        ...(body.userType === 'b2b' && {
          business_value_rating: body.businessValueRating,
          customer_support_rating: body.customerSupportRating,
          integration_ease_rating: body.integrationEaseRating,
          pricing_satisfaction_rating: body.pricingSatisfactionRating,
          business_impact: body.businessImpact,
          roi_feedback: body.roiFeedback,
        }),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 