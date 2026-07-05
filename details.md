# ClipSplit Pro Project Details

## Overview

ClipSplit Pro is a production-oriented online video splitter. It lets users upload a video, choose a clip length from 3 to 15 seconds, split the video on the backend with native FFmpeg, and download either individual clips or a ZIP file containing all generated clips.

The project is a JavaScript monorepo with:

- A React/Vite frontend in `client/`
- An Express API backend in `server/`
- Shared root npm scripts for development, build, testing, and server startup

The app is designed for creators who need short clips for TikTok, Instagram Reels, YouTube Shorts, lessons, product demos, ads, highlight reels, and similar workflows.

## Main Capabilities

- Upload MP4, MOV, WEBM, or MKV video files.
- Validate browser support, file type, file size, and video duration before processing.
- Choose clip duration from 3 to 15 seconds.
- Estimate the number of output clips before processing.
- Show warnings for large or risky processing jobs.
- Upload video to the backend through `XMLHttpRequest` so upload progress can be tracked.
- Stream backend progress updates through Server-Sent Events.
- Split video with native FFmpeg on the server.
- Generate numbered clip files such as `clip-001.mp4`.
- Download individual clips.
- Download all clips as `clipsplit-output.zip`.
- Automatically clean temporary files after download or after one hour.
- Track privacy-friendly analytics events.
- Provide SEO pages, blog pages, sitemap files, FAQ schema, and metadata.
- Provide contact and feedback API routes backed by optional Supabase storage.

## Technology Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Framer Motion
- Lucide React icons
- React Helmet Async for SEO metadata
- Vitest and Testing Library for tests

### Backend

- Node.js
- Express
- Multer for multipart video uploads
- Native FFmpeg through `child_process.spawn`
- Archiver for ZIP creation
- Helmet for security headers
- CORS middleware
- Morgan for logging
- Express Rate Limit
- Express Validator
- Supabase client
- Nodemailer for optional contact form email notifications

## Repository Structure

```text
.
├── client/
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── image-sitemap.xml
│   │   ├── og-image.svg
│   │   ├── robots.txt
│   │   ├── site.webmanifest
│   │   ├── sitemap.xml
│   │   └── sw.js
│   ├── scripts/
│   │   └── generate-sitemap.mjs
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── test/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── lib/
│   │   ├── schema.sql
│   │   └── supabase.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validate.js
│   ├── routes/
│   │   ├── analytics.js
│   │   ├── contact.js
│   │   ├── feedback.js
│   │   ├── health.js
│   │   └── splitVideo.js
│   ├── index.js
│   ├── package.json
│   ├── README.md
│   └── vercel.json
├── OFF_PAGE_SEO_PLAN.md
├── package.json
├── README.md
├── TESTING.md
└── vercel.json
```

## Root Scripts

The root `package.json` provides workspace-level commands:

```bash
npm run dev
```

Starts the frontend development server from `client/`.

```bash
npm run server
```

Starts the backend development server from `server/`.

```bash
npm run build
```

Builds the frontend production bundle.

```bash
npm test
```

Runs the frontend test suite.

## Frontend Details

### Application Routing

The main React router lives in `client/src/App.jsx`.

Routes include:

- `/` - Home page with the upload and split tool
- `/about` - About page
- `/privacy-policy` - Privacy policy
- `/terms-and-conditions` - Terms page
- `/contact` - Contact page
- `/blog` - Blog index
- `/blog/:slug` - Blog post detail page
- `/html-sitemap` - HTML sitemap
- `*` - Not found page

Most non-home pages are lazy-loaded with React `lazy` and `Suspense`.

On every route change, the app:

- Tracks a `page_view` event.
- Scrolls the browser window to the top.

### Home Page

The home page is assembled in `client/src/pages/Home.jsx`.

It includes:

- SEO metadata and FAQ JSON-LD schema
- Hero section
- Video uploader and splitter tool
- How-it-works section
- Feature list
- SEO content block
- FAQ section
- Latest blog guide links

### Video Upload Flow

The main upload experience is implemented in `client/src/components/VideoUploader.jsx`.

The workflow is:

1. User selects or drops a video file.
2. Browser validates support, file type, and file size.
3. Browser reads video metadata to get duration.
4. App validates duration, with a recommended limit of 30 minutes.
5. App estimates clip count based on selected clip duration.
6. User starts splitting.
7. Frontend sends the video to the server using `splitVideoOnServer`.
8. Upload progress is shown from `XMLHttpRequest.upload.onprogress`.
9. Server progress is streamed through `EventSource`.
10. Completed clip URLs and ZIP URL are returned.
11. User can download clips individually or download the ZIP.

### Client-Side Validation

Validation utilities live in `client/src/utils/videoUtils.js`.

The app validates:

- Supported browser APIs
- Accepted file formats
- Maximum file size, currently aligned with the backend 1GB limit
- Video duration, with a recommended upper limit of 30 minutes
- Clip count and processing risk warnings

### Server Video Service

The browser-to-backend bridge is in `client/src/utils/serverVideoService.js`.

Important behavior:

- `API_BASE` comes from `VITE_API_BASE_URL`.
- In development, it defaults to `http://localhost:4000`.
- In production, it defaults to same-origin requests.
- A client-generated `jobId` connects the upload request with the SSE progress stream.
- `XMLHttpRequest` is used instead of `fetch` because upload progress events are needed.
- `EventSource` listens to `/api/split-video/events/:jobId`.
- Relative clip and ZIP URLs returned by the backend are converted to absolute URLs.

### SEO

SEO support includes:

- React Helmet Async component usage
- Canonical metadata
- Open Graph metadata
- Twitter card metadata
- JSON-LD for FAQ, breadcrumbs, articles, and application data
- `robots.txt`
- XML sitemap
- Image sitemap
- HTML sitemap
- Blog pages generated from `client/src/data/blogPosts.js`

## Backend Details

### Server Entry Point

The Express server starts in `server/index.js`.

It configures:

- Environment loading with `dotenv`
- Helmet security headers
- CORS
- JSON and URL-encoded body parsing with small limits
- Morgan request logging outside test mode
- Global rate limiting
- API route mounting
- 404 handling
- Global error handling

Default API port:

```text
4000
```

Default allowed frontend origin:

```text
http://localhost:5173
```

### API Routes

The backend mounts these route groups:

- `GET /api/health`
- `POST /api/contact`
- `POST /api/analytics`
- `GET /api/analytics/summary`
- `POST /api/feedback`
- `GET /api/feedback/summary`
- `POST /api/split-video`
- `GET /api/split-video/events/:jobId`
- `GET /api/split-video/jobs/:jobId/clips/:filename`
- `GET /api/split-video/jobs/:jobId/zip`

### Video Splitting Route

The core video backend is `server/routes/splitVideo.js`.

It uses:

- `multer` for uploads
- `os.tmpdir()` for temporary storage
- `crypto.randomUUID()` for job IDs when needed
- `EventEmitter` for progress updates
- `spawn` for native FFmpeg execution
- `archiver` for ZIP creation

Temporary root:

```text
<system temp>/clipsplit-pro
```

Upload directory:

```text
<system temp>/clipsplit-pro/uploads
```

Job output directory:

```text
<system temp>/clipsplit-pro/jobs/<jobId>
```

Generated clips directory:

```text
<system temp>/clipsplit-pro/jobs/<jobId>/clips
```

### Accepted Video Inputs

The backend accepts:

- `.mp4`
- `.mov`
- `.webm`
- `.mkv`
- MIME types starting with `video/`

Maximum upload size defaults to:

```text
1GB
```

The limit can be overridden with:

```text
MAX_VIDEO_UPLOAD_BYTES
```

### Clip Duration Rules

The backend requires clip duration to be:

- A whole number
- At least 3 seconds
- At most 15 seconds

Invalid durations return a 400 error.

### FFmpeg Command

The server uses FFmpeg segment output with stream copy where possible:

```bash
ffmpeg -i input -c copy -map 0 -segment_time <duration> -f segment -reset_timestamps 1 clip-%03d.mp4
```

This is fast because it avoids full re-encoding when the input format allows stream copying.

### FFmpeg Resolution

The backend resolves FFmpeg in this order:

1. `FFMPEG_PATH` environment variable, if set.
2. Project-local `.tools/ffmpeg/ffmpeg.exe`.
3. Project-local `.tools/ffmpeg/bin/ffmpeg.exe`.
4. Windows Winget links location.
5. Windows app alias location.
6. Recursive search under project-local `.tools/ffmpeg`.
7. Recursive search under the Winget package directory.
8. Fallback to `ffmpeg` from `PATH`.

This was added because Windows/Winget can report command aliases while an already-running server process still cannot resolve `ffmpeg` through `PATH`.

Recommended Windows install command:

```bash
winget install Gyan.FFmpeg
```

If the server still cannot see FFmpeg after installation, restart the terminal and backend server, or set:

```text
FFMPEG_PATH=C:\path\to\ffmpeg.exe
```

### Progress Updates

Progress is streamed through Server-Sent Events:

```text
GET /api/split-video/events/:jobId
```

The backend publishes progress stages such as:

- Uploading
- Splitting
- Creating ZIP
- Completed
- Error

The splitting stage uses timed progress updates while FFmpeg runs, then marks progress as completed when output succeeds.

### Split Response

Successful `POST /api/split-video` responses include:

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

### Cleanup Behavior

Generated files are cleaned up in two ways:

- Automatically after one hour.
- After ZIP download, with a short delay.

If an error occurs during processing, the uploaded temp file and job directory are removed.

### Error Handling

Video-specific errors include:

- Unsupported format
- Invalid duration
- Missing upload
- File too large
- Server disk full
- Missing FFmpeg
- Unsupported or damaged video
- FFmpeg failure
- Expired or cleaned-up generated clips

Global error handling returns JSON with:

```json
{
  "success": false,
  "error": "Message here"
}
```

In development, stack traces are also included.

## Analytics

Analytics are handled by `server/routes/analytics.js` and `client/src/utils/analytics.js`.

Accepted event names:

- `page_view`
- `video_uploaded`
- `split_started`
- `split_completed`
- `split_cancelled`
- `zip_downloaded`
- `clip_downloaded`
- `error_occurred`

The analytics route is privacy-friendly:

- No cookies
- No fingerprinting
- No personal data intended
- PII-like metadata keys are stripped
- Nested metadata objects are ignored

If Supabase is configured, analytics events are inserted into `analytics_events`.

Analytics failures are intentionally non-fatal so they do not break the user experience.

## Contact Form

The contact API lives in `server/routes/contact.js`.

It:

- Validates name, email, subject, and message.
- Stores messages in Supabase when configured.
- Optionally sends an email notification with Nodemailer when SMTP settings are configured.

Contact submissions are rate-limited.

## Feedback

The feedback route stores user satisfaction feedback when Supabase is configured. It also provides a protected summary endpoint for admin-style reporting.

## Supabase

Supabase support is optional but used for:

- Contact messages
- Analytics events
- Feedback entries

Database schema is provided in:

```text
server/lib/schema.sql
```

Supabase environment variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Environment Variables

Important backend variables:

- `PORT` - API port, defaults to `4000`
- `NODE_ENV` - development, test, or production
- `ALLOWED_ORIGINS` - comma-separated list of allowed frontend origins
- `FFMPEG_PATH` - optional direct path to native FFmpeg binary
- `MAX_VIDEO_UPLOAD_BYTES` - optional upload limit, defaults to 1GB
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `NOTIFY_EMAIL` - email address for contact notifications
- `ADMIN_TOKEN` - token for protected summary endpoints

Important frontend variables:

- `VITE_API_BASE_URL` - backend base URL used by the browser

## Local Development

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

Start the backend:

```bash
npm run server
```

Backend default URL:

```text
http://localhost:4000
```

Install FFmpeg on Windows:

```bash
winget install Gyan.FFmpeg
```

If the backend was already running when FFmpeg was installed, restart the backend server.

## Testing

The testing checklist is documented in `TESTING.md`.

Automated commands:

```bash
npm install
npm test
npm run build
```

Automated coverage includes:

- `VideoUploader`
- `DurationSelector`
- `ProgressPanel`
- `ClipGrid`
- `ErrorMessage`
- `SEO`
- Video utility functions

Manual testing should cover:

- Valid video uploads
- Unsupported files
- Files above 1GB
- Videos longer than 30 minutes
- Clip durations from 3 to 15 seconds
- Short and long split jobs
- Large clip-count warnings
- Individual clip downloads
- ZIP downloads
- Cancel processing
- Clear project
- Page refresh behavior
- Chrome, Edge, and Firefox
- Responsive breakpoints
- SEO metadata
- Accessibility
- Performance

## Deployment Notes

The frontend can be built with:

```bash
npm run build
```

The backend requires a runtime that supports:

- Native binaries
- Long-running requests
- Multipart uploads
- Temporary disk storage
- FFmpeg availability

This is important because serverless platforms with short request timeouts or no native binary support may not be suitable for large video splitting jobs.

For production, make sure:

- FFmpeg is installed and available through `PATH` or `FFMPEG_PATH`.
- `ALLOWED_ORIGINS` contains the production frontend origin.
- Supabase variables are configured if analytics, contact storage, or feedback storage are needed.
- SMTP variables are configured if contact email notifications are needed.
- Upload size and server disk limits are appropriate for expected videos.

## Known Operational Considerations

- Splitting speed depends on upload bandwidth, video size, codec, server CPU, server disk speed, and server load.
- The FFmpeg command uses stream copy, which is fast, but clip boundaries may depend on keyframes.
- Very large videos can consume significant temporary disk space.
- Generated assets expire after one hour.
- Analytics and contact storage are optional; the app should still function if Supabase is not configured.
- React Router currently logs future-flag warnings in development; these warnings do not block the app.
- Windows FFmpeg installs may require a terminal/server restart before `PATH` changes are visible.

## Current Status

The project is working locally as intended. The recent backend update improved FFmpeg discovery so Windows/Winget installations are less likely to cause `Native FFmpeg is not installed or not available in PATH` errors.
