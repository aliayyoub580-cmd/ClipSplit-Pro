import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import Breadcrumbs from "../components/Breadcrumbs";
import { blogPosts } from "../data/blogPosts";
import { breadcrumbSchema } from "../utils/seo";

export default function BlogIndex() {
  const items = [{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }];
  return (
    <>
      <SEO title="Video Splitter Blog - ClipSplit Pro" description="Guides for splitting videos online, making short clips, and preparing content for TikTok, Reels, and Shorts." path="/blog" jsonLd={[breadcrumbSchema(items)]} />
      <Breadcrumbs items={items} />
      <section className="app-container py-16">
        <h1 className="text-4xl font-black md:text-5xl">Video splitter blog</h1>
        <p className="mt-5 max-w-3xl leading-8 text-muted">SEO-focused guides for online video splitting, MP4 clip making, short-form workflows, and privacy-friendly browser processing.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="glass rounded-2xl p-5 hover:border-cyan/60">
              <p className="text-xs uppercase text-cyan">{post.keyword}</p>
              <h2 className="mt-3 text-xl font-bold">{post.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{post.excerpt}</p>
              <p className="mt-4 text-xs text-muted">{post.readingTime} by {post.author}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
