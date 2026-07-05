import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found - ClipSplit Pro</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <section className="app-container py-24">
        <h1 className="text-4xl font-black">Page not found</h1>
        <p className="mt-4 text-muted">This page does not exist.</p>
        <Link className="mt-6 inline-block rounded-2xl bg-gradient-to-r from-cyan to-violet px-5 py-3 font-bold text-night" to="/">Go home</Link>
      </section>
    </>
  );
}
