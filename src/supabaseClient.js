// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Get these values from your Supabase dashboard
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);