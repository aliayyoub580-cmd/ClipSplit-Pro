/**
 * POST /api/feedback
 *
 * Collects short user-satisfaction feedback after a split is completed.
 *
 * Request body:
 *  {
 *    rating    : number  (1–5, required)
 *    comment   : string  (optional, max 1000 chars)
 *    page      : string  (optional, which page the feedback came from)
 *    session_id: string  (optional, anonymous session identifier)
 *  }
 *
 * Supabase table schema:
 *
 *   create table user_feedback (
 *     id          uuid primary key default gen_random_uuid(),
 *     rating      smallint not null check (rating >= 1 and rating <= 5),
 *     comment     text,
 *     page        text,
 *     session_id  text,
 *     created_at  timestamptz default now()
 *   );
 *
 *   alter table user_feedback enable row level security;
 *   create policy "anon_insert" on user_feedback
 *     for insert with check (true);
 */

const router = require("express").Router();
const { body } = require("express-validator");

const { feedbackLimiter } = require("../middleware/rateLimiter");
const { validate } = require("../middleware/validate");
const { getSupabase, isSupabaseConfigured } = require("../lib/supabase");

// ─── Validation rules ─────────────────────────────────────────────────────────
const feedbackValidation = [
  body("rating")
    .notEmpty().withMessage("Rating is required.")
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be a whole number between 1 and 5."),

  body("comment")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Comment must not exceed 1000 characters."),

  body("page")
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage("Page path too long."),

  body("session_id")
    .optional()
    .trim()
    .isLength({ max: 64 }).withMessage("session_id too long."),
];

// ─── Route handler ────────────────────────────────────────────────────────────
router.post(
  "/",
  feedbackLimiter,
  feedbackValidation,
  validate,
  async (req, res, next) => {
    try {
      const { rating, comment, page, session_id } = req.body;

      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        const { error: dbError } = await supabase
          .from("user_feedback")
          .insert([
            {
              rating: Number(rating),
              comment: comment || null,
              page: page || null,
              session_id: session_id || null,
            },
          ]);

        if (dbError) {
          console.error("[feedback] Supabase insert error:", dbError.message);
        }
      }

      return res.status(201).json({
        success: true,
        message: "Thank you for your feedback!",
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/feedback/summary  (admin-only) ─────────────────────────────────
router.get("/summary", async (req, res, next) => {
  const adminToken = process.env.ADMIN_TOKEN;
  if (adminToken && req.headers["x-admin-token"] !== adminToken) {
    return res.status(401).json({ success: false, error: "Unauthorized." });
  }

  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      success: false,
      error: "Feedback database is not configured.",
    });
  }

  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("user_feedback")
      .select("rating, comment, page, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);

    const totalRatings = data.length;
    const averageRating =
      totalRatings > 0
        ? (data.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(2)
        : null;

    return res.status(200).json({
      success: true,
      totalRatings,
      averageRating: averageRating ? Number(averageRating) : null,
      recent: data.slice(0, 20),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
