// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Read environment variables (must exist)
const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey: string = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);