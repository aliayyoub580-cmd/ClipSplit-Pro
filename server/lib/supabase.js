/**
 * Supabase client initialisation.
 *
 * Two clients are exported:
 *
 *  supabase          – anon/public key  → safe to use for public reads and
 *                      RLS-protected inserts (contact messages, analytics, etc.)
 *
 *  supabaseAdmin     – service-role key → bypasses RLS, only used in server-side
 *                      routes that need privileged access. Never expose this key
 *                      to the frontend.
 *
 * Both clients are lazy-singletons: they are created only when first imported,
 * so tests can set env vars before importing this module.
 */

const { createClient } = require("@supabase/supabase-js");

// ─── Validate required env vars ──────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "⚠️  SUPABASE_URL or SUPABASE_ANON_KEY is not set. " +
      "Supabase features (contact, analytics, feedback) will be unavailable."
  );
}

// ─── Public client (anon key, respects RLS) ───────────────────────────────────
let _supabase = null;

function getSupabase() {
  if (!_supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  }
  return _supabase;
}

// ─── Admin client (service-role key, bypasses RLS) ───────────────────────────
let _supabaseAdmin = null;

function getSupabaseAdmin() {
  if (!_supabaseAdmin && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    _supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _supabaseAdmin;
}

// ─── Helper: check if Supabase is configured ─────────────────────────────────
function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

module.exports = { getSupabase, getSupabaseAdmin, isSupabaseConfigured };
