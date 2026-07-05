# ClipSplit Pro – Backend API

Lightweight Express.js API server that handles everything the browser **cannot or should not** do:

| Concern | Handler |
|---|---|
| Contact form submissions | `POST /api/contact` |
| Privacy-friendly analytics | `POST /api/analytics` |
| User satisfaction feedback | `POST /api/feedback` |
| Liveness / readiness check | `GET  /api/health` |
| Native FFmpeg splitting | `POST /api/split-video` |
| Split progress stream | `GET  /api/split-video/events/:jobId` |

> Video splitting runs here with native FFmpeg.  
> Install `ffmpeg` on the host or set `FFMPEG_PATH` to the binary path.

---

## Quick Start

```bash
# 1. Install dependencies
cd server
npm install

# 2. Configure environment
cp .env.example .env
# → Edit .env with your Supabase keys and SMTP credentials

# 3. Set up the database
# → Open Supabase SQL editor and run lib/schema.sql

# 4. Start dev server
npm run dev
# API available at http://localhost:4000
```

---

## API Reference

### `GET /api/health`

Returns server status and Supabase connectivity.

**Response 200**
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "supabase": { "configured": true, "reachable": true }
}
```

---

### `POST /api/split-video`

Upload one video and split it into clips.

**Multipart fields**

| Field | Description |
|---|---|
| `video` | MP4, MOV, WEBM, or MKV file |
| `duration` | Whole-second clip duration from 3 to 15 |
| `jobId` | Optional client-generated id used by the progress SSE stream |

**Response 200**
```json
{
  "jobId": "job-id",
  "clips": [
    {
      "id": "clip-001.mp4",
      "name": "clip-001.mp4",
      "number": 1,
      "duration": 3,
      "url": "/api/split-video/jobs/job-id/clips/clip-001.mp4"
    }
  ],
  "zipUrl": "/api/split-video/jobs/job-id/zip",
  "expiresInSeconds": 3600
}
```

Temporary upload, clip, and ZIP files are removed after ZIP download or after one hour.

---

### `POST /api/contact`

Submit a contact form message.

**Request body**
```json
{
  "name":    "Jane Doe",
  "email":   "jane@example.com",
  "subject": "Question about ClipSplit Pro",
  "message": "How many clips can I generate at once?"
}
```

**Response 201**
```json
{
  "success": true,
  "message": "Your message has been received. We will get back to you shortly."
}
```

**Rate limit:** 5 requests per IP per hour.

---

### `POST /api/analytics`

Log an anonymous usage event. No PII is collected or stored.

**Allowed event types**

| Event | When to fire |
|---|---|
| `page_view` | User navigates to a page |
| `video_uploaded` | User selects a video file |
| `split_started` | User clicks Split Video |
| `split_completed` | All clips generated successfully |
| `split_cancelled` | User clicked Cancel |
| `zip_downloaded` | User clicked Download All |
| `clip_downloaded` | User downloaded a single clip |
| `error_occurred` | A client error was encountered |

**Request body**
```json
{
  "event":      "split_completed",
  "page":       "/",
  "session_id": "anon-uuid-here",
  "metadata": {
    "clip_count": 200,
    "clip_duration": 3,
    "duration_seconds": 42
  }
}
```

**Response:** `204 No Content`

**Rate limit:** 60 requests per IP per minute.

---

### `POST /api/feedback`

Submit a star rating and optional comment.

**Request body**
```json
{
  "rating":    5,
  "comment":   "Incredibly fast! Processed 200 clips in under a minute.",
  "page":      "/",
  "session_id": "anon-uuid-here"
}
```

**Response 201**
```json
{
  "success": true,
  "message": "Thank you for your feedback!"
}
```

**Rate limit:** 10 requests per IP per hour.

---

### `GET /api/analytics/summary` *(admin)*

Returns event counts for the last 30 days.  
Requires `x-admin-token` header matching `ADMIN_TOKEN` env var.

### `GET /api/feedback/summary` *(admin)*

Returns average rating and most recent 20 feedback entries.  
Requires `x-admin-token` header matching `ADMIN_TOKEN` env var.

---

## Environment Variables

See `.env.example` for the full reference. Required variables:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server only) |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins |

Optional:

| Variable | Description |
|---|---|
| `SMTP_HOST` | SMTP server for email notifications |
| `SMTP_PORT` | SMTP port (587 or 465) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password / app password |
| `NOTIFY_EMAIL` | Address to receive contact notifications |
| `ADMIN_TOKEN` | Token for protected admin endpoints |
| `FFMPEG_PATH` | Optional path to native FFmpeg binary |
| `MAX_VIDEO_UPLOAD_BYTES` | Optional upload limit, defaults to 1GB |

---

## Project Structure

```
server/
├── index.js                  # App entry point
├── package.json
├── vercel.json               # Vercel serverless config
├── .env.example
├── .gitignore
├── lib/
│   ├── supabase.js           # Supabase client factory
│   └── schema.sql            # Database setup SQL
├── middleware/
│   ├── rateLimiter.js        # Per-route rate limits
│   ├── errorHandler.js       # 404 + global error handler
│   └── validate.js           # express-validator helper
└── routes/
    ├── health.js             # GET  /api/health
    ├── contact.js            # POST /api/contact
    ├── analytics.js          # POST /api/analytics
    └── feedback.js           # POST /api/feedback
```

---

## Deployment on Vercel

```bash
# From the server/ directory
vercel deploy --prod
```

Set all environment variables in the Vercel dashboard under  
**Project → Settings → Environment Variables**.

The `vercel.json` routes all `/api/*` requests to the Express app  
with a 10-second max function duration (well within Vercel Hobby limits).

---

## Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and paste the contents of `lib/schema.sql`.
3. Run the script. Three tables will be created with RLS policies applied.
4. Copy your **Project URL**, **anon key**, and **service-role key** into `.env`.
