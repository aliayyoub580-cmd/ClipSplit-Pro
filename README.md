# ClipSplit Pro

Production-ready online video splitter built with React, Vite, Tailwind CSS, Framer Motion, and an Express API with native FFmpeg splitting.

Video files are uploaded to the backend, split with native FFmpeg, packaged into a ZIP, and cleaned from temporary storage automatically.

## Quick Start

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

API:

```bash
npm run server
```

API: `http://localhost:4000`

## Structure

```text
client/   React app, SEO pages, tests, upload/progress UI
server/   Express API for video splitting, downloads, contact, analytics, feedback
```

## Deployment

The backend needs native `ffmpeg` available in `PATH` or `FFMPEG_PATH`. Use a server/runtime that supports long-running requests, multipart uploads, temporary disk storage, and native binaries.

For Vercel, deploy from the repository root (`.`), not from `client/`.

Recommended Vercel settings:

```text
Root Directory: .
Install Command: npm install
Build Command: npm run build
Output Directory: client/dist
```

The root `vercel.json` rewrites `/api/*` to the Express serverless entrypoint at `api/index.js`. If Vercel is configured with Root Directory `client`, API requests will be handled by the React static app instead of Express.
