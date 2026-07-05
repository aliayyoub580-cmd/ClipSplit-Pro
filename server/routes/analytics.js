/**
 * POST /api/analytics
 *
 * Lightweight, privacy-friendly analytics event logging.
 * No personal data, no cookies, no fingerprinting.
 * Only aggregated usage events are stored.
 *
 * Accepted event types:
 *  - page_view        : user visited a page
 *  - video_uploaded   : user uploaded a video (stores duration + size bucket)
 *  - split_started    : user started a split (stores clip_duration + clip_count)
 *  - split_completed  : split finished successfully (stores duration_seconds)
 *  - split_cancelled  : user cancelled processing
 *  - zip_downloaded   : user downloaded all clips as ZIP
 *  - clip_downloaded  : user downloaded a single clip
 *  - error_occurred   : a client-side error was encountered (stores error_code)
 *
 * Supabase table schema:
 *
 *   create table analytics_events (
 *     id           uuid primary key default gen_random_uuid(),
 *     event        text not null,
 *     page         text,
 *     metadata     jsonb,
 *     session_id   text,
 *     country      text,
 *     created_at   timestamptz default now()
 *   );
 *
 *   alter table analytics_events enable row level security;
 *   create policy "anon_insert" on analytics_events
 *     for insert with check (true);
 */

const router = require("express").Router();
const { body } = require("express-validator");

const { analyticsLimiter } = require("../middleware/rateLimiter");
const { validate } = require("../middleware/validate");
const { getSupabase, isSupabaseConfigured } = require("../lib/supabase");

// ─── Allowed event types whitelist ───────────────────────────────────────────
const ALLOWED_EVENTS = [
  "page_view",
  "video_uploaded",
  "split_started",
  "split_completed",
  "split_cancelled",
  "zip_downloaded",
  "clip_downloaded",
  "error_occurred",
];

// ─── Validation rules ─────────────────────────────────────────────────────────
const analyticsValidation = [
  body("event")
    .trim()
    .notEmpty().withMessage("Event name is required.")
    .isIn(ALLOWED_EVENTS).withMessage(`Event must be one of: ${ALLOWED_EVENTS.join(", ")}.`),

  body("page")
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage("Page path too long."),

  body("session_id")
    .optional()
    .trim()
    .isLength({ max: 64 }).withMessage("session_id too long."),

  // metadata must be a plain object if provided; individual keys are not validated
  // to keep the schema flexible for future event types.
  body("metadata")
    .optional()
    .isObject().withMessage("metadata must be a JSON object."),
];

// ─── Route handler ────────────────────────────────────────────────────────────
router.post(
  "/",
  analyticsLimiter,
  analyticsValidation,
  validate,
  async (req, res, next) => {
    try {
      const { event, page, session_id, metadata } = req.body;

      // Strip any PII-like keys from metadata before storing
      const safeMetadata = sanitiseMetadata(metadata);

      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        const { error: dbError } = await supabase
          .from("analytics_events")
          .insert([
            {
              event,
              page: page || null,
              session_id: session_id || null,
              metadata: safeMetadata,
              // Country can be injected by Vercel edge headers
              country: req.headers["x-vercel-ip-country"] || null,
            },
          ]);

        if (dbError) {
          console.error("[analytics] Supabase insert error:", dbError.message);
          // Non-fatal – analytics failures should never break the user experience
        }
      }

      // Always return 204 No Content for analytics (fast & silent)
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/analytics/summary  (admin-only, basic stats) ───────────────────
router.get("/summary", async (req, res, next) => {
  // Simple token check – replace with proper auth middleware for production
  const adminToken = process.env.ADMIN_TOKEN;
  if (adminToken && req.headers["x-admin-token"] !== adminToken) {
    return res.status(401).json({ success: false, error: "Unauthorized." });
  }

  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      success: false,
      error: "Analytics database is not configured.",
    });
  }

  try {
    const supabase = getSupabase();

    // Total events per type in the last 30 days
    const { data, error } = await supabase
      .from("analytics_events")
      .select("event")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw new Error(error.message);

    // Aggregate client-side (simple count by event type)
    const summary = data.reduce((acc, row) => {
      acc[row.event] = (acc[row.event] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({ success: true, period: "last_30_days", summary });
  } catch (err) {
    next(err);
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Remove keys that could contain PII (email, name, ip, etc.)
 * and limit object depth/size.
 */
function sanitiseMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") return null;

  const PII_KEYS = ["email", "name", "ip", "user", "phone", "address", "password"];
  const sanitised = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (PII_KEYS.includes(key.toLowerCase())) continue;
    // Only store primitives (no nested objects)
    if (typeof value === "object") continue;
    sanitised[key] = value;
  }

  return Object.keys(sanitised).length > 0 ? sanitised : null;
}

module.exports = router;
