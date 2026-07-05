/**
 * Rate-limiting middleware using express-rate-limit.
 *
 * Three tiers:
 *  generalLimiter  – applied globally to every route
 *  contactLimiter  – stricter limit for contact form submissions
 *  analyticsLimiter – relaxed limit for high-frequency analytics pings
 */

const rateLimit = require("express-rate-limit");

// ─── General limiter (all routes) ────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please wait a moment and try again.",
  },
});

// ─── Contact form limiter ─────────────────────────────────────────────────────
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 contact submissions per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error:
      "Too many messages sent from your IP. Please wait an hour before sending again.",
  },
});

// ─── Analytics event limiter ──────────────────────────────────────────────────
const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // up to 60 events per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Analytics rate limit exceeded.",
  },
});

// ─── Feedback limiter ─────────────────────────────────────────────────────────
const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many feedback submissions. Please try again later.",
  },
});

module.exports = {
  generalLimiter,
  contactLimiter,
  analyticsLimiter,
  feedbackLimiter,
};
