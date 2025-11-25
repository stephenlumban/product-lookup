
import { createClient } from '@supabase/supabase-js'

// Note: In Vite, environment variables must be prefixed with VITE_ to be exposed to the client
// If your .env has SUPABASE_URL and SUPABASE_ANON_KEY, they need to be renamed to:
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
