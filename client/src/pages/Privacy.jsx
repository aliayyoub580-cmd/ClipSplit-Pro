import SEO from "../components/SEO";
import Breadcrumbs from "../components/Breadcrumbs";
import { breadcrumbSchema } from "../utils/seo";

export default function Privacy() {
  const items = [{ label: "Home", href: "/" }, { label: "Privacy Policy", href: "/privacy-policy" }];
  return (
    <>
      <SEO title="Privacy Policy - ClipSplit Pro" description="ClipSplit Pro uploads videos for fast server-side splitting and automatically removes temporary files." path="/privacy-policy" jsonLd={[breadcrumbSchema(items)]} />
      <Breadcrumbs items={items} />
      <section className="app-container py-16">
        <h1 className="text-4xl font-black md:text-5xl">Privacy Policy</h1>
        <div className="mt-8 max-w-3xl space-y-5 leading-8 text-muted">
          <p>Videos are uploaded to the ClipSplit Pro server for native FFmpeg splitting.</p>
          <p>Uploaded videos, generated clips, and ZIP files are temporary and are cleaned after download or after one hour.</p>
          <p>Optional analytics may record anonymous usage events such as page views, split starts, split completions, and errors. Contact form submissions are stored only when you submit them.</p>
          <p>Do not upload content you do not have the right to process or download.</p>
        </div>
      </section>
    </>
  );
}
