/**
 * GET /api/health
 *
 * Simple liveness + readiness check.
 * Returns Supabase connectivity status so deployment pipelines
 * can verify the full stack is reachable.
 */

const router = require("express").Router();
const { getSupabase, isSupabaseConfigured } = require("../lib/supabase");

router.get("/", async (req, res) => {
  const supabaseStatus = { configured: isSupabaseConfigured(), reachable: null };

  // Optional: ping Supabase to verify connectivity
  if (supabaseStatus.configured) {
    try {
      const supabase = getSupabase();
      // A lightweight query that works even with an empty database
      const { error } = await supabase.from("_health_check").select("1").limit(1);
      // Table may not exist – that's fine, the connection itself succeeded
      supabaseStatus.reachable = !error || error.code === "PGRST116";
    } catch {
      supabaseStatus.reachable = false;
    }
  }

  res.status(200).json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    supabase: supabaseStatus,
  });
});

module.exports = router;
