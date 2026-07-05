/**
 * Rate-limiting middleware using express-rate-limit.
 *
 * The video splitter uses a long-lived Server-Sent Events connection for
 * progress updates, so progress streams are excluded from the shared global
 * bucket and upload attempts use their own dedicated limiter.
 */

const rateLimit = require("express-rate-limit");

const isProduction = process.env.NODE_ENV === "production";
const generalMax = positiveInteger(process.env.RATE_LIMIT_GENERAL_MAX, isProduction ? 200 : 2000);
const splitVideoMax = positiveInteger(process.env.RATE_LIMIT_SPLIT_VIDEO_MAX, isProduction ? 30 : 300);

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: generalMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith("/api/split-video/events/"),
  message: {
    success: false,
    error: "Too many requests. Please wait a moment and try again.",
  },
});

const splitVideoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: splitVideoMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many video split requests. Please wait a moment and try again.",
  },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many messages sent from your IP. Please wait an hour before sending again.",
  },
});

const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Analytics rate limit exceeded.",
  },
});

const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
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
  splitVideoLimiter,
  contactLimiter,
  analyticsLimiter,
  feedbackLimiter,
};

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
