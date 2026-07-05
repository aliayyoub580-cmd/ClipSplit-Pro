/**
 * POST /api/contact
 *
 * Accepts a contact form submission and:
 *  1. Validates all fields server-side.
 *  2. Stores the message in the Supabase `contact_messages` table.
 *  3. (Optional) Sends an email notification via Nodemailer if
 *     SMTP credentials are configured.
 *
 * Supabase table schema (run this SQL in your Supabase project):
 *
 *   create table contact_messages (
 *     id          uuid primary key default gen_random_uuid(),
 *     name        text not null,
 *     email       text not null,
 *     subject     text not null,
 *     message     text not null,
 *     ip_address  text,
 *     user_agent  text,
 *     created_at  timestamptz default now()
 *   );
 *
 *   -- Only the service role (backend) can insert; no public reads.
 *   alter table contact_messages enable row level security;
 *   create policy "service_role_insert" on contact_messages
 *     for insert with check (true);
 */

const router = require("express").Router();
const { body } = require("express-validator");
const nodemailer = require("nodemailer");

const { contactLimiter } = require("../middleware/rateLimiter");
const { validate } = require("../middleware/validate");
const { getSupabaseAdmin, isSupabaseConfigured } = require("../lib/supabase");

// ─── Validation rules ─────────────────────────────────────────────────────────
const contactValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters."),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please enter a valid email address.")
    .normalizeEmail(),

  body("subject")
    .trim()
    .notEmpty().withMessage("Subject is required.")
    .isLength({ min: 3, max: 150 }).withMessage("Subject must be between 3 and 150 characters."),

  body("message")
    .trim()
    .notEmpty().withMessage("Message is required.")
    .isLength({ min: 10, max: 5000 }).withMessage("Message must be between 10 and 5000 characters."),
];

// ─── Optional email notification ─────────────────────────────────────────────
async function sendEmailNotification({ name, email, subject, message }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !NOTIFY_EMAIL) return;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"ClipSplit Pro Contact" <${SMTP_USER}>`,
    to: NOTIFY_EMAIL,
    replyTo: email,
    subject: `[ClipSplit Contact] ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `
      <h2>New Contact Message – ClipSplit Pro</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr />
      <p style="white-space:pre-wrap">${message}</p>
    `,
  });
}

// ─── Route handler ────────────────────────────────────────────────────────────
router.post(
  "/",
  contactLimiter,
  contactValidation,
  validate,
  async (req, res, next) => {
    try {
      const { name, email, subject, message } = req.body;

      const payload = {
        name,
        email,
        subject,
        message,
        ip_address: req.ip || null,
        user_agent: req.headers["user-agent"] || null,
      };

      // ── Persist to Supabase ──────────────────────────────────────────────
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseAdmin();
        const { error: dbError } = await supabase
          .from("contact_messages")
          .insert([payload]);

        if (dbError) {
          console.error("[contact] Supabase insert error:", dbError.message);
          // Non-fatal: continue so email notification can still fire
        }
      }

      // ── Optional email notification ───────────────────────────────────────
      try {
        await sendEmailNotification({ name, email, subject, message });
      } catch (mailErr) {
        console.error("[contact] Email notification failed:", mailErr.message);
        // Non-fatal
      }

      return res.status(201).json({
        success: true,
        message: "Your message has been received. We will get back to you shortly.",
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
