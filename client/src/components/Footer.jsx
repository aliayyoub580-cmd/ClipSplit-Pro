import { Link } from "react-router-dom";

const links = [
  ["Home", "/"],
  ["About", "/about"],
  ["Blog", "/blog"],
  ["Contact", "/contact"],
  ["Privacy", "/privacy-policy"],
  ["Terms", "/terms-and-conditions"],
  ["Sitemap", "/html-sitemap"]
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 py-10">
      <div className="app-container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-bold">ClipSplit Pro</p>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Browser-based video splitter for fast short-clip creation. No login required.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-muted" aria-label="Footer navigation">
          {links.map(([label, href]) => (
            <Link key={href} to={href} className="hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
