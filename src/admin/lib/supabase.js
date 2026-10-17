// src/lib/supabase.js
//
// Supabase client. NEVER throws when env vars are missing — the app must keep
// rendering in demo mode (no secrets set yet). Export `isSupabaseConfigured`
// and a client (or null) so every data layer can check before calling.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  // Only warn in dev so production builds stay quiet.
  if (import.meta.env.DEV) {
    console.info(
      '%cDemo mode active — Supabase env vars are not set. The site is showing mock data.',
      'color: #7FA356; font-weight: 600;',
    );
  }
}

// A null client means "use mock data everywhere". Every service layer must
// check isSupabaseConfigured before touching this.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      realtime: { params: { events: 'INSERT,UPDATE,DELETE' } },
    })
  : null;