import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import Breadcrumbs from "../components/Breadcrumbs";
import { blogPosts } from "../data/blogPosts";
import { breadcrumbSchema } from "../utils/seo";

const pages = [
  ["/", "Home"],
  ["/about", "About"],
  ["/blog", "Blog"],
  ["/contact", "Contact"],
  ["/privacy-policy", "Privacy Policy"],
  ["/terms-and-conditions", "Terms and Conditions"]
];

export default function HtmlSitemap() {
  const items = [{ label: "Home", href: "/" }, { label: "HTML Sitemap", href: "/html-sitemap" }];
  return (
    <>
      <SEO title="HTML Sitemap - ClipSplit Pro" description="Browse every public ClipSplit Pro page and blog article." path="/html-sitemap" jsonLd={[breadcrumbSchema(items)]} />
      <Breadcrumbs items={items} />
      <section className="app-container py-16">
        <h1 className="text-4xl font-black md:text-5xl">HTML Sitemap</h1>
        <h2 className="mt-10 text-2xl font-bold">Pages</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {pages.map(([href, label]) => <li key={href}><Link className="text-cyan hover:text-white" to={href}>{label}</Link></li>)}
        </ul>
        <h2 className="mt-10 text-2xl font-bold">Articles</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {blogPosts.map((post) => <li key={post.slug}><Link className="text-cyan hover:text-white" to={`/blog/${post.slug}`}>{post.title}</Link></li>)}
        </ul>
      </section>
    </>
  );
}
