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
const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.use(generalLimiter);

app.use("/api/health", healthRouter);
app.use("/api/contact", contactRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api", splitVideoRouter);

app.use(notFound);
app.use(errorHandler);

app.locals.allowedOrigins = allowedOrigins;

module.exports = app;

function isAllowedOrigin(origin) {
  if (allowedOrigins.includes(origin)) return true;

  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === "https:" && (hostname === "vercel.app" || hostname.endsWith(".vercel.app"));
  } catch {
    return false;
  }
}

function parseAllowedOrigins(value) {
  return (value || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}
