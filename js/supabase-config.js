/**
 * INTERNWELL SLIET - Supabase Client Configuration
 * 
 * Instructions:
 * 1. Create a free account at https://supabase.com
 * 2. Create a new project (e.g. "internwell-sliet")
 * 3. Go to Project Settings -> API
 * 4. Paste your Project URL and 'anon' public key below.
 * 
 * SECURITY NOTICE:
 * The `anon` key is designed to be public and works in conjunction with PostgreSQL
 * Row Level Security (RLS) policies defined in `supabase_schema.sql`.
 * NEVER expose or commit your `service_role` secret key!
 */

window.SUPABASE_CONFIG = {
  // Live Supabase Project URL:
  url: 'https://uhnkxgocnihflutwshsg.supabase.co',

  // Live Supabase Anon Public Key (safe for frontend client with RLS):
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVobmt4Z29jbmloZmx1dHdzaHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNjk3NjYsImV4cCI6MjEwNjc0NTc2Nn0.8EamEf-_Hbd9DpF2xG-wqNO2YUJbS_aabqP_dnjkRks'
};

/**
 * Check if real Supabase credentials are configured
 */
function isSupabaseConfigured() {
  const cfg = window.SUPABASE_CONFIG;
  return Boolean(
    cfg &&
    cfg.url &&
    cfg.anonKey &&
    !cfg.url.includes('your-project-ref') &&
    !cfg.anonKey.includes('your-anon-key-here') &&
    cfg.url.startsWith('https://')
  );
}

/**
 * Initialize and get the Supabase Client instance
 */
function getSupabaseClient() {
  if (window._supabaseInstance) {
    return window._supabaseInstance;
  }

  if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
    console.warn('[InternWell Backend] Supabase JS SDK not loaded yet.');
    return null;
  }

  if (isSupabaseConfigured()) {
    try {
      window._supabaseInstance = window.supabase.createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
      );
      return window._supabaseInstance;
    } catch (err) {
      console.error('[InternWell Backend] Failed to initialize Supabase client:', err);
      return null;
    }
  } else {
    // Graceful fallback notice for developer
    console.info(
      '%c[InternWell Backend] Supabase credentials not set in js/supabase-config.js. Running in Local Demo Storage mode.%c\nTo connect live cloud database, update `js/supabase-config.js` and run `supabase_schema.sql` in your Supabase SQL Editor.',
      'color: #38bdf8; font-weight: bold;',
      'color: inherit;'
    );
    return null;
  }
}

window.isSupabaseConfigured = isSupabaseConfigured;
window.getSupabaseClient = getSupabaseClient;
