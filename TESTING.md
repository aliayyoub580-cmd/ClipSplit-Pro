# ClipSplit Pro Testing Checklist

## Automated

Run after installing Node.js and npm:

```bash
npm install
npm test
npm run build
```

Coverage includes:

- `VideoUploader`
- `DurationSelector`
- `ProgressPanel`
- `ClipGrid`
- `ErrorMessage`
- `SEO`
- `calculateClipCount`
- `formatFileSize`
- `formatDuration`
- `validateFileType`
- `validateFileSize`
- `validateVideoDuration`
- `generateClipFilename`
- `estimateProcessingRisk`

## Manual Browser Tests

- Upload valid MP4.
- Upload unsupported file.
- Upload file above 1GB.
- Upload video longer than 30 minutes.
- Select every duration from 3 to 15 seconds.
- Split a 30-second video into 3-second clips.
- Split a 10-minute video into 3-second clips on a strong desktop.
- Generate more than 200 clips and verify warning copy.
- Generate more than 300 estimated clips and verify high-risk warning copy.
- Download one clip.
- Download all clips as ZIP.
- Cancel processing.
- Clear project.
- Refresh page after upload.
- Test Chrome, Edge, and Firefox.
- Test slow device behavior where available.

## Responsive

Check layout at:

- 360px
- 390px
- 430px
- 768px
- 1024px
- 1280px
- 1440px

## SEO

- Confirm title, description, canonical, robots, Open Graph, Twitter card, and JSON-LD are present.
- Confirm `robots.txt`, `sitemap.xml`, `image-sitemap.xml`, and `/html-sitemap` load.
- Validate SoftwareApplication, BreadcrumbList, FAQPage, and Article schema.
- Check all public pages are indexable and the 404 route is noindex.
- Run a broken-link crawl before launch.

## Accessibility

- Keyboard navigate upload, duration, split, cancel, download, and contact form controls.
- Confirm visible focus states.
- Confirm errors use `role="alert"`.
- Confirm progress updates use `aria-live`.
- Check color contrast in the dark theme.

## Performance

- Measure initial page load under 3 seconds where possible.
- Confirm FFmpeg loads only after Split Video is clicked.
- Track FFmpeg load time, metadata read time, split time, ZIP creation time, and UI responsiveness.
- Run Lighthouse/PageSpeed and target LCP under 2.5s, CLS under 0.1, and INP under 200ms.
