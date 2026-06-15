/* PJCC backend config.
 *
 * SAFE TO COMMIT: the anon key is a *public* client key. It is designed to live
 * in browser code — Row Level Security (the policies in docs/supabase-setup.sql)
 * is what actually protects the data, not the secrecy of this key.
 *
 * Fill these two values in from your Supabase project:
 *   Supabase dashboard -> Project Settings -> API
 *     - "Project URL"        -> SUPABASE_URL
 *     - "anon" / "public" key -> SUPABASE_ANON_KEY
 *
 * Until both are filled in, the profile system stays OFF and every game falls
 * back to local-only storage (no accounts, no leaderboards) — nothing breaks.
 */
window.PJCC_CONFIG = {
  SUPABASE_URL: 'https://xcweewddvpdcofiitoye.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjd2Vld2RkdnBkY29maWl0b3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NTUyNDksImV4cCI6MjA5NzEzMTI0OX0._Vmpo2b5oLvnv6Zei3pH26lsZ4whadQECc256qvGyao'
};
