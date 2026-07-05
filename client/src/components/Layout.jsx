import { Link, NavLink } from "react-router-dom";
import { Scissors } from "lucide-react";
import Footer from "./Footer";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" }
];

export default function Layout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-night">
      <div className="pointer-events-none absolute left-[-9rem] top-[-8rem] h-80 w-80 rounded-full bg-cyan/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute bottom-20 right-[-10rem] h-96 w-96 rounded-full bg-violet/20 blur-3xl animate-float" style={{ animationDelay: "-5s" }} />
      <header className="sticky top-0 z-50 border-b border-white/10 bg-night/78 backdrop-blur-xl">
        <nav className="app-container flex h-16 items-center justify-between" aria-label="Main navigation">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan to-violet text-night">
              <Scissors size={20} aria-hidden="true" />
            </span>
            <span>ClipSplit Pro</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm text-muted md:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} to={item.href} className={({ isActive }) => isActive ? "text-white" : "hover:text-white"}>
                {item.label}
              </NavLink>
            ))}
          </div>
          <a href="/#upload-tool" className="rounded-full border border-white/12 px-4 py-2 text-sm font-semibold hover:border-cyan/70 hover:text-cyan">
            Split Video
          </a>
        </nav>
      </header>
      <main className="relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
