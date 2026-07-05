import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import Hero from "../components/Hero";
import VideoUploader from "../components/VideoUploader";
import FAQ, { faqs } from "../components/FAQ";
import { blogPosts } from "../data/blogPosts";

export default function Home() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer }
    }))
  };

  return (
    <>
      <SEO jsonLd={[faqSchema]} />
      <Hero />
      <VideoUploader />
      <HowItWorks />
      <Features />
      <SeoContent />
      <FAQ />
      <section className="app-container pb-16">
        <h2 className="text-3xl font-black">Latest video splitting guides</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {blogPosts.slice(0, 6).map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="glass rounded-2xl p-5 hover:border-cyan/60">
              <p className="text-xs uppercase text-cyan">{post.readingTime}</p>
              <h3 className="mt-2 font-bold">{post.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function HowItWorks() {
  return (
    <section className="app-container py-16" id="how-it-works">
      <h2 className="text-3xl font-black">How it works</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {["Upload a video", "Choose 3 to 15 seconds", "Split and download clips"].map((item, index) => (
          <article key={item} className="glass rounded-2xl p-6">
            <p className="text-sm text-cyan">Step {index + 1}</p>
            <h3 className="mt-2 text-xl font-bold">{item}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">ClipSplit Pro calculates the output count before processing and uses native FFmpeg on the server for fast splitting.</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    "3 to 15 second clip duration",
    "MP4, MOV, WEBM, and MKV",
    "Stream-copy FFmpeg command where possible",
    "Progress percentage and current clip count",
    "Download individual clips or ZIP",
    "No account required"
  ];
  return (
    <section className="app-container py-16" id="features">
      <h2 className="text-3xl font-black">Features</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature} className="rounded-2xl border border-white/12 bg-white/[0.04] p-5 font-semibold">{feature}</div>
        ))}
      </div>
    </section>
  );
}

function SeoContent() {
  return (
    <section className="app-container py-16">
      <div className="max-w-4xl">
        <h2 className="text-3xl font-black">Free online video splitter for short clips</h2>
        <p className="mt-5 leading-8 text-muted">
          ClipSplit Pro is a fast video splitter for creators who need to split video online without installing editing software. Use it as a free video splitter, MP4 splitter, video clip maker, or short video cutter for TikTok, Instagram Reels, YouTube Shorts, lessons, product demos, and highlight reels.
        </p>
        <p className="mt-4 leading-8 text-muted">
          The app uploads your video to the server, splits it with native FFmpeg, creates a ZIP, and automatically cleans temporary files after download or after one hour.
        </p>
      </div>
    </section>
  );
}
