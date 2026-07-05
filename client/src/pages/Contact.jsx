import { useState } from "react";
import SEO from "../components/SEO";
import Breadcrumbs from "../components/Breadcrumbs";
import { breadcrumbSchema } from "../utils/seo";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function Contact() {
  const items = [{ label: "Home", href: "/" }, { label: "Contact", href: "/contact" }];
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  async function submit(event) {
    event.preventDefault();
    setStatus("Sending...");
    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error();
      setStatus("Your message has been received.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("Contact API is unavailable. Please try again later.");
    }
  }

  return (
    <>
      <SEO title="Contact ClipSplit Pro" description="Contact the ClipSplit Pro team about the browser-based video splitter." path="/contact" jsonLd={[breadcrumbSchema(items)]} />
      <Breadcrumbs items={items} />
      <section className="app-container py-16">
        <h1 className="text-4xl font-black md:text-5xl">Contact</h1>
        <form onSubmit={submit} className="glass mt-8 grid max-w-2xl gap-4 rounded-3xl p-6">
          {[
            ["name", "Name", "text"],
            ["email", "Email", "email"],
            ["subject", "Subject", "text"]
          ].map(([name, label, type]) => (
            <label key={name} className="grid gap-2 text-sm font-semibold">
              {label}
              <input className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-white" type={type} required value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} />
            </label>
          ))}
          <label className="grid gap-2 text-sm font-semibold">
            Message
            <textarea className="min-h-36 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-white" required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
          </label>
          <button className="rounded-2xl bg-gradient-to-r from-cyan to-violet px-5 py-3 font-bold text-night" type="submit">Send message</button>
          {status && <p className="text-sm text-muted" role="status">{status}</p>}
        </form>
      </section>
    </>
  );
}
