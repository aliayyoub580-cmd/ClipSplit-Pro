import { Link, useParams } from "react-router-dom";
import SEO from "../components/SEO";
import Breadcrumbs from "../components/Breadcrumbs";
import { blogPosts, getPost } from "../data/blogPosts";
import { absoluteUrl, breadcrumbSchema } from "../utils/seo";

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPost(slug);

  if (!post) {
    return (
      <section className="app-container py-20">
        <h1 className="text-4xl font-black">Article not found</h1>
        <Link className="mt-6 inline-block text-cyan" to="/blog">Back to blog</Link>
      </section>
    );
  }

  const items = [{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.title, href: `/blog/${post.slug}` }];
  const related = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 4);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Organization", name: post.author },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`)
  };

  return (
    <>
      <SEO title={`${post.title} - ClipSplit Pro`} description={post.excerpt} path={`/blog/${post.slug}`} type="article" jsonLd={[breadcrumbSchema(items), articleSchema]} />
      <Breadcrumbs items={items} />
      <article className="app-container py-16">
        <div className="max-w-3xl">
          <p className="text-sm uppercase text-cyan">{post.keyword}</p>
          <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">{post.title}</h1>
          <p className="mt-5 text-muted">{post.readingTime} by {post.author}. Last updated {post.date}.</p>
          <div className="glass mt-8 rounded-2xl p-5">
            <h2 className="font-bold">Table of contents</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
              <li><a href="#workflow" className="hover:text-white">Workflow</a></li>
              <li><a href="#best-practices" className="hover:text-white">Best practices</a></li>
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
            </ol>
          </div>
          <section id="workflow" className="mt-10 space-y-4 leading-8 text-muted">
            <h2 className="text-2xl font-bold text-white">Workflow</h2>
            {post.sections.map((section) => <p key={section}>{section}</p>)}
            <p>Open the <Link className="text-cyan" to="/">video splitter tool</Link>, choose your clip duration, and download the generated files individually or as a ZIP.</p>
          </section>
          <section id="best-practices" className="mt-10 space-y-4 leading-8 text-muted">
            <h2 className="text-2xl font-bold text-white">Best practices</h2>
            <p>Keep files under 1GB, keep videos under 30 minutes, and use a reliable connection for the smoothest upload and processing flow.</p>
            <p>When you expect more than 200 clips, choose a longer duration or split a shorter source file to reduce output size.</p>
          </section>
          <section id="faq" className="mt-10">
            <h2 className="text-2xl font-bold">FAQ</h2>
            <div className="mt-4 space-y-3 text-muted">
              <p><strong className="text-white">Does this upload my video?</strong> Yes. Processing runs on the server with native FFmpeg, and temporary files are cleaned automatically.</p>
              <p><strong className="text-white">What format works best?</strong> MP4 is the most reliable option.</p>
            </div>
          </section>
        </div>
        <aside className="mt-12">
          <h2 className="text-2xl font-bold">Related articles</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <Link key={item.slug} to={`/blog/${item.slug}`} className="glass rounded-2xl p-5 hover:border-cyan/60">
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.readingTime}</p>
              </Link>
            ))}
          </div>
        </aside>
      </article>
    </>
  );
}
