// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://whspcnovvaqeztgtcsjl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3Bjbm92dmFxZXp0Z3Rjc2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNDI0MDUsImV4cCI6MjA1NjcxODQwNX0.dadXKAcGccwgVwrBcwEpDp5jeQRo5w-_A4z_MmbrbFo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);