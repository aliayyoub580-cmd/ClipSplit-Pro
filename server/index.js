/**
 * ClipSplit Pro - Express API Server
 *
 * Handles:
 *  - Contact form submissions
 *  - Analytics event logging
 *  - User feedback
 *  - Health checks
 *  - Native FFmpeg video splitting
 *
 * Video splitting runs server-side with native FFmpeg.
 */

require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

const { generalLimiter } = require("./middleware/rateLimiter");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const healthRouter = require("./routes/health");
const contactRouter = require("./routes/contact");
const analyticsRouter = require("./routes/analytics");
const feedbackRouter = require("./routes/feedback");
const splitVideoRouter = require("./routes/splitVideo");

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / curl requests (no origin header)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ─── Request Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ─── Global Rate Limit ───────────────────────────────────────────────────────
app.use(generalLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/health", healthRouter);
app.use("/api/contact", contactRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api", splitVideoRouter);

// ─── 404 + Error Handling ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  ClipSplit Pro API running on port ${PORT}`);
  console.log(`   ENV  : ${process.env.NODE_ENV || "development"}`);
  console.log(`   CORS : ${allowedOrigins.join(", ")}`);
});

module.exports = app; // exported for testing
