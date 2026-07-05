import SEO from "../components/SEO";
import Breadcrumbs from "../components/Breadcrumbs";
import { breadcrumbSchema } from "../utils/seo";

export default function Terms() {
  const items = [{ label: "Home", href: "/" }, { label: "Terms", href: "/terms-and-conditions" }];
  return (
    <>
      <SEO title="Terms and Conditions - ClipSplit Pro" description="Read the basic usage terms for ClipSplit Pro, an online video splitter." path="/terms-and-conditions" jsonLd={[breadcrumbSchema(items)]} />
      <Breadcrumbs items={items} />
      <section className="app-container py-16">
        <h1 className="text-4xl font-black md:text-5xl">Terms and Conditions</h1>
        <div className="mt-8 max-w-3xl space-y-5 leading-8 text-muted">
          <p>ClipSplit Pro is provided as an online video splitting tool. Use it responsibly and only with videos you have permission to edit.</p>
          <p>Processing performance depends on upload speed, server capacity, codec, and file size.</p>
          <p>The service is provided without guarantees that every file, codec, or browser will work.</p>
          <p>We may update features, limits, and API behavior as the product improves.</p>
        </div>
      </section>
    </>
  );
}
