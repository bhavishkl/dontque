import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const city = searchParams.get('city');

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // Only get results from user's city
    const { data: results, error } = await supabase
      .from('queues')
      .select('name, location, category')
      .ilike('location', `%${city}%`)
      .or(`name.ilike.%${query}%,location.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(5);

    if (error) throw error;

    const suggestions = results.map(queue => ({
      name: queue.name,
      category: queue.category,
      location: queue.location
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Search suggestion error:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
} 