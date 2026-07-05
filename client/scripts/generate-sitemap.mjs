import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { blogPosts } from "../src/data/blogPosts.js";

const site = "https://clipsplitpro.com";
const staticRoutes = [
  ["/", "weekly", "1.0"],
  ["/about", "monthly", "0.7"],
  ["/contact", "monthly", "0.6"],
  ["/privacy-policy", "yearly", "0.4"],
  ["/terms-and-conditions", "yearly", "0.4"],
  ["/blog", "weekly", "0.9"],
  ["/html-sitemap", "monthly", "0.5"]
];

const urls = [
  ...staticRoutes.map(([path, changefreq, priority]) => ({ path, changefreq, priority })),
  ...blogPosts.map((post) => ({ path: `/blog/${post.slug}`, changefreq: "monthly", priority: "0.8" }))
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${site}${url.path === "/" ? "" : url.path}</loc><lastmod>2026-07-05</lastmod><changefreq>${url.changefreq}</changefreq><priority>${url.priority}</priority></url>`).join("\n")}
</urlset>
`;

writeFileSync(resolve("public", "sitemap.xml"), xml);
