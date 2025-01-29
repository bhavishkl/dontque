import { createClient } from '@supabase/supabase-js'

// This client should only be used on the server side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Use service key instead of anon key

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)
