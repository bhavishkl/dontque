import { NextResponse } from 'next/server';
import { supabaseServer } from '@/app/lib/supabase-server';

export async function POST(request) {
  try {
    const { table, action, data, filters } = await request.json();
    
    // Basic validation
    if (!table || !action) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Initialize query
    let query = supabaseServer.from(table);

    // Apply the requested action
    switch (action) {
      case 'select':
        query = query.select(data?.select || '*');
        break;
      case 'insert':
        query = query.insert(data);
        break;
      case 'update':
        query = query.update(data);
        break;
      case 'delete':
        query = query.delete();
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Apply filters if provided
    if (filters) {
      filters.forEach(filter => {
        const { type, column, value } = filter;
        switch (type) {
          case 'eq':
            query = query.eq(column, value);
            break;
          case 'neq':
            query = query.neq(column, value);
            break;
          case 'gt':
            query = query.gt(column, value);
            break;
          case 'lt':
            query = query.lt(column, value);
            break;
          case 'gte':
            query = query.gte(column, value);
            break;
          case 'lte':
            query = query.lte(column, value);
            break;
          case 'in':
            query = query.in(column, value);
            break;
          case 'contains':
            query = query.contains(column, value);
            break;
        }
      });
    }

    // Execute the query
    const { data: result, error } = await query;

    if (error) throw error;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Database operation failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
