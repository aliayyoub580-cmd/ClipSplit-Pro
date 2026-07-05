import SEO from "../components/SEO";
import Breadcrumbs from "../components/Breadcrumbs";
import { breadcrumbSchema } from "../utils/seo";

export default function About() {
  const items = [{ label: "Home", href: "/" }, { label: "About", href: "/about" }];
  return (
    <>
      <SEO title="About ClipSplit Pro - Online Video Splitter" description="Learn how ClipSplit Pro splits uploaded videos into short clips with native FFmpeg." path="/about" jsonLd={[breadcrumbSchema(items)]} />
      <Breadcrumbs items={items} />
      <section className="app-container py-16">
        <h1 className="text-4xl font-black md:text-5xl">About ClipSplit Pro</h1>
        <p className="mt-6 max-w-3xl leading-8 text-muted">
          ClipSplit Pro helps creators split long videos into short clips using fast native FFmpeg processing. It is built for repurposing workflows, simple downloads, and no-account editing.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {["Native FFmpeg", "No login required", "Creator workflow"].map((title) => (
            <article key={title} className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">The tool focuses on practical video splitting with reusable clips, ZIP downloads, and automatic cleanup.</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
