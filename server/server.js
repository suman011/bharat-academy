const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
// Always load server/.env; override so values here win over stale Windows env vars
require("dotenv").config({ path: path.join(__dirname, ".env"), override: true });

const dbUrl = String(process.env.DATABASE_URL || "").trim();
if (!dbUrl) {
  const hint =
    "Set DATABASE_URL to your PostgreSQL connection string (Render: Web Service → Environment, or link a Render Postgres and use the Internal/External URL).";
  if (process.env.NODE_ENV === "production") {
    console.error(`[FATAL] ${hint}`);
    process.exit(1);
  }
  console.warn(`[warn] DATABASE_URL missing — ${hint}`);
}

const app = express();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const prisma = new PrismaClient();

const CLIENT_ORIGINS = String(
  process.env.CLIENT_ORIGIN ||
    "http://localhost:5173,http://localhost:3000,http://localhost:3002,http://localhost:8080,https://bharat-academy.onrender.com,https://bharatskillacademy.com,https://www.bharatskillacademy.com"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // No Origin: non-browser, curl, or some same-site requests — allow.
      if (!origin) return cb(null, true);
      try {
        const u = new URL(origin);
        // Local dev (Vite, etc.)
        if (u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1")) {
          return cb(null, true);
        }
        // Render (and preview URLs under *.onrender.com)
        if (u.protocol === "https:" && u.hostname.endsWith(".onrender.com")) {
          return cb(null, true);
        }
      } catch {
        // ignore
      }
      if (CLIENT_ORIGINS.includes(origin)) return cb(null, true);
      // Do not pass Error — that becomes a 500. Reflect CORS denial without throwing.
      console.warn(`[CORS] Blocked origin: ${origin}`);
      return cb(null, false);
    },
    credentials: true,
  })
);

// Health check (useful for dry-run verification)
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "course-academy-server" });
});

const PORT = Number(process.env.PORT || 5002);
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "academy_token";

const isProd = process.env.NODE_ENV === "production";
// When the SPA is on a different host than this API (e.g. custom domain + Render API),
// browsers require SameSite=None and Secure for auth cookies on fetch(..., { credentials: "include" }).
const crossSiteAuth = String(process.env.AUTH_CROSS_SITE || "").trim().toLowerCase() === "true";
const cookieOptions = {
  httpOnly: true,
  secure: crossSiteAuth || isProd,
  sameSite: crossSiteAuth ? "none" : "lax",
  path: "/",
};

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isEmail(v) {
  const s = String(v || "").trim();
  return s.includes("@") && s.includes(".");
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Demo form sends structured fields; callback modals send a single optional message. */
function buildCallbackStoredMessage({ mobile, rawMessage, courseLabel, company, leadEmail, notes }) {
  const msg = String(rawMessage || "").trim();
  const cl = String(courseLabel || "").trim();
  const co = String(company || "").trim();
  const em = String(leadEmail || "").trim();
  const nt = String(notes || "").trim();
  const hasDemoFields = Boolean(cl || co || em || nt);
  if (!hasDemoFields) return msg || null;

  const lines = ["Course demo request", ""];
  if (cl) lines.push(`Course: ${cl}`);
  if (co) lines.push(`Company: ${co}`);
  if (em) lines.push(`Email: ${em}`);
  lines.push(`Phone: ${mobile}`);
  if (nt) lines.push("", "Notes:", nt);
  const built = lines.join("\n");
  if (msg && msg !== built) return `${built}\n\n---\n\n${msg}`;
  return built;
}

function buildLeadNotificationHtml({ name, mobile, courseKey, courseLabel, company, leadEmail, notes, extraMessage }) {
  const courseDisplay = String(courseLabel || "").trim() || String(courseKey || "").trim() || "—";
  let html = `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.55;color:#0f172a;">`;
  html += `<h2 style="margin:0 0 14px;font-size:18px;">New lead submission</h2>`;
  html += `<div style="background:#f8fafc;padding:16px 18px;border-radius:10px;border:1px solid #e2e8f0;">`;
  const row = (label, val) => {
    const t = String(val ?? "").trim();
    if (!t) return "";
    return `<p style="margin:0 0 14px;"><strong style="color:#475569;display:block;margin-bottom:4px;">${escapeHtml(label)}</strong><span style="color:#0f172a;white-space:pre-wrap;">${escapeHtml(t)}</span></p>`;
  };
  html += row("Full name", name);
  html += row("Mobile", mobile);
  html += row("Course", courseDisplay);
  html += row("Company", company);
  html += row("Email", leadEmail);
  html += row("Notes", notes);
  const ex = String(extraMessage || "").trim();
  if (ex) {
    html += `<p style="margin:0 0 4px;"><strong style="color:#475569;">Message</strong></p>`;
    html += `<p style="margin:0;white-space:pre-wrap;color:#0f172a;">${escapeHtml(ex)}</p>`;
  }
  html += `</div></div>`;
  return html;
}

function safeUser(u) {
  return {
    id: u.id,
    name: u.name || null,
    email: u.email,
    mobile: u.mobile || null,
    createdAt: u.createdAt,
  };
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

async function getAuthUser(req) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return null;
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    return user || null;
  } catch {
    return null;
  }
}

async function requireAuth(req, res) {
  const user = await getAuthUser(req);
  if (!user) {
    try {
      console.warn(`[AUTH] Blocked request: ${req.method} ${req.path}`);
    } catch {
      // ignore
    }
    res.status(401).json({ ok: false, error: "Not authenticated" });
    return null;
  }
  return user;
}

const smtpUser = String(process.env.SMTP_USER || "").trim();
const smtpPass = String(process.env.SMTP_PASS || "")
  .trim()
  .replace(/\s/g, "")
  .replace(/^["']|["']$/g, "");
const smtpHost = String(process.env.SMTP_HOST || "").trim();
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
const mailFrom = (() => {
  const raw = String(process.env.OTP_FROM || smtpUser || "").trim().replace(/^["']|["']$/g, "");
  return raw || smtpUser;
})();
const supportEmail = process.env.SUPPORT_EMAIL || mailFrom || smtpUser || "support@bharatskillacademy.com";

/** HTTPS API — works on Render free tier where SMTP ports 25/465/587 are blocked. https://resend.com */
const resendApiKey = String(process.env.RESEND_API_KEY || "").trim();
const resendFromDefault = "Bharat Skill Development Academy <onboarding@resend.dev>";

let transporter = null;
if (smtpUser && smtpPass && smtpHost) {
  const isGmail = /gmail\.com/i.test(String(smtpHost));
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass },
    ...(isGmail && smtpPort === 587 && !smtpSecure
      ? { requireTLS: true, tls: { minVersion: "TLSv1.2" } }
      : {}),
  });
  transporter
    .verify()
    .then(() => console.log("[SMTP] Connection verified — outbound mail is enabled."))
    .catch((err) => {
      console.error("[SMTP] Verification failed (emails will not send until this passes):", err?.message || err);
      if (isGmail) {
        console.error(
          "[SMTP] Gmail: use a 16-character App Password (Google Account → Security → 2-Step Verification → App passwords), not your normal Gmail password."
        );
      }
    });
} else if (!resendApiKey) {
  console.warn(
    "[mail] No RESEND_API_KEY and no SMTP — outbound email disabled. On Render Free, SMTP ports are blocked: add RESEND_API_KEY (see server/.env.example) or use a paid instance for SMTP."
  );
}

if (resendApiKey) {
  console.log(
    "[mail] Resend API enabled (HTTPS). Set RESEND_FROM to your verified domain sender after DNS setup; until then onboarding@resend.dev may only reach your Resend-account email."
  );
}

function mailConfigured() {
  return Boolean(resendApiKey || transporter);
}

/**
 * Send one email via Resend (preferred when RESEND_API_KEY is set) or Nodemailer SMTP.
 */
async function deliverEmail({ to, subject, html, text }) {
  const recipients = (Array.isArray(to) ? to : String(to || "").split(/[,;]/))
    .map((s) => s.trim())
    .filter(Boolean);
  if (!recipients.length) return { sent: false, reason: "no recipient" };

  if (resendApiKey) {
    try {
      const from = String(process.env.RESEND_FROM || "").trim() || resendFromDefault;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: recipients,
          subject: String(subject || "").slice(0, 998),
          html: String(html || ""),
          ...(text ? { text: String(text) } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof data?.message === "string" ? data.message : JSON.stringify(data);
        console.error("[RESEND] Send failed:", res.status, msg);
        return { sent: false, reason: msg || String(res.status) };
      }
      return { sent: true };
    } catch (e) {
      console.error("[RESEND]", e?.message || e);
      return { sent: false, reason: String(e?.message || e) };
    }
  }

  if (!transporter) return { sent: false, reason: "SMTP not configured" };
  try {
    await transporter.sendMail({
      from: mailFrom || smtpUser,
      to: recipients.join(", "),
      subject,
      html,
      ...(text ? { text } : {}),
    });
    return { sent: true };
  } catch (e) {
    console.error("[SMTP] sendMail failed:", e?.message || e);
    return { sent: false, reason: String(e?.message || e) };
  }
}

async function sendResetEmail({ to, resetUrl }) {
  const subject = "Reset your password";
  const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin: 0 0 8px;">Password reset</h2>
        <p style="margin: 0 0 12px;">Click this link to reset your password (valid for 1 hour):</p>
        <p style="margin: 0 0 12px;"><a href="${resetUrl}">${resetUrl}</a></p>
        <p style="margin: 12px 0 0; color: #475569; font-size: 13px;">
          If you didn't request this, you can ignore this email.
        </p>
      </div>
    `;
  const result = await deliverEmail({ to, subject, html });
  if (!result.sent) {
    console.error(`[RESET] Email send failed: ${result.reason || "unknown"}`);
    return { sent: false, reason: result.reason || "Email send failed" };
  }
  return { sent: true };
}

function formatInr(n) {
  try {
    return Number(n || 0).toLocaleString("en-IN");
  } catch {
    return String(n || 0);
  }
}

async function sendOrderEmail({
  to,
  userName,
  courseTitle,
  orderId,
  paymentMethod,
  amountPaid,
  discountPct,
  purchaseDate,
  items,
  originalPrice,
  discountAmount,
}) {
  if (!mailConfigured()) return { sent: false, reason: "Email not configured" };
  const subject = `Course Enrollment Confirmation – ${courseTitle}`;
  try {
    const itemsHtml = (items || [])
      .map(
        (it) => `
          <tr>
            <td style="padding:10px 0; border-bottom:1px solid #e2e8f0;">
              <div style="font-weight:700; color:#0f172a;">${String(it.name || "Course")}</div>
              <div style="color:#64748b; font-size:13px;">Qty: ${Number(it.qty || 1)}</div>
            </td>
            <td style="padding:10px 0; text-align:right; border-bottom:1px solid #e2e8f0; font-weight:700; color:#0f172a;">
              ₹${formatInr(Number(it.price || 0) * Number(it.qty || 1))}
            </td>
          </tr>
        `
      )
      .join("");

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <div style="max-width: 640px; margin: 0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden;">
          <div style="padding: 18px 22px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%); color:#fff;">
            <div style="font-size: 14px; opacity: 0.95; font-weight: 700;">Bharat Skill Development Academy</div>
            <div style="font-size: 20px; font-weight: 800; margin-top: 2px;">Enrollment confirmed</div>
          </div>

          <div style="padding: 22px;">
            <p style="margin:0 0 12px;">Hi <strong>${String(userName || "Learner")}</strong>,</p>
            <p style="margin:0 0 14px;">
              Thank you for enrolling with <strong>Bharat Skill Development Academy</strong>.
              Your payment was <strong>successful</strong> and your access is now active.
            </p>

            <div style="padding:14px 14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; margin: 14px 0 18px;">
              <div style="font-weight:800; margin-bottom: 6px;">Course details</div>
              <div><strong>Course:</strong> ${String(courseTitle)}</div>
              <div><strong>Access:</strong> Login with this email: <strong>${String(to)}</strong></div>
              <div><strong>Order ID:</strong> ${String(orderId)}</div>
              <div><strong>Payment method:</strong> ${String(paymentMethod)}</div>
              <div><strong>Purchase date:</strong> ${String(purchaseDate)}</div>
            </div>

            <div style="font-weight:800; margin-bottom: 8px;">Order summary</div>
            <table style="width:100%; border-collapse:collapse;">
              ${itemsHtml}
              <tr>
                <td style="padding:10px 0; color:#334155; font-weight:700;">Original price</td>
                <td style="padding:10px 0; text-align:right; color:#0f172a; font-weight:800;">₹${formatInr(originalPrice)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; color:#0f766e; font-weight:800;">Discount (${Number(discountPct || 0)}% Off)</td>
                <td style="padding:6px 0; text-align:right; color:#0f766e; font-weight:900;">-₹${formatInr(discountAmount)}</td>
              </tr>
              <tr>
                <td style="padding:12px 0; border-top:1px solid #e2e8f0; font-weight:900;">Total paid</td>
                <td style="padding:12px 0; border-top:1px solid #e2e8f0; text-align:right; font-weight:900;">₹${formatInr(amountPaid)}</td>
              </tr>
            </table>

            <div style="margin-top: 16px; padding: 14px; border-radius: 14px; border: 1px solid #e2e8f0; background: #ffffff;">
              <div style="font-weight:900; margin-bottom: 8px;">Next steps</div>
              <ol style="margin:0; padding-left: 18px; color:#334155;">
                <li>Open your academy site and go to the login page.</li>
                <li>Login using <strong>${String(to)}</strong>.</li>
                <li>Start learning in <strong>${String(courseTitle)}</strong>.</li>
              </ol>
            </div>

            <p style="margin: 16px 0 0; color:#475569; font-size: 13px;">
              Need help? Contact us at <a href="mailto:${supportEmail}" style="color:#4f46e5; font-weight:800; text-decoration:none;">${supportEmail}</a>.
            </p>
          </div>
        </div>
        <p style="max-width:640px; margin: 12px auto 0; color:#94a3b8; font-size:12px; text-align:center;">
          © ${new Date().getFullYear()} Bharat Skill Development Academy
        </p>
      </div>
    `;

    const result = await deliverEmail({ to, subject, html });
    if (!result.sent) {
      console.error(`[ORDER] Email send failed: ${result.reason || "unknown"}`);
      return { sent: false, reason: result.reason || "Email send failed" };
    }
    return { sent: true };
  } catch (err) {
    console.error(`[ORDER] Email send failed: ${err?.message || err}`);
    return { sent: false, reason: "Email send failed" };
  }
}

function formatInr(n) {
  const v = Number(n || 0);
  return `₹${v.toLocaleString("en-IN")}`;
}

function buildEnrollmentEmailHtml({
  userName,
  userEmail,
  courseName,
  orderId,
  paymentMethod,
  amountPaid,
  discountPct,
  purchaseDate,
  loginUrl,
  supportEmail,
  manualStaffVerification,
  paymentReference,
}) {
  const staffVerified = Boolean(manualStaffVerification);
  const refRow =
    paymentReference && String(paymentReference).trim()
      ? `<tr>
            <td style="padding: 8px 0; color: #475569;">Staff verification ref.</td>
            <td style="padding: 8px 0; font-weight: 700; text-align: right; word-break: break-all;">${String(
              paymentReference
            ).trim()}</td>
          </tr>`
      : "";
  const statusTitle = staffVerified ? "Enrollment confirmed" : "Payment successful";
  const statusBody = staffVerified
    ? "Our team matched your transfer to this order in our bank/UPI records and confirmed your enrollment. This is not an automatic payment-gateway receipt."
    : "We have received your payment and your enrollment is confirmed.";
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
    <div style="max-width: 640px; margin: 0 auto; padding: 22px;">
      <div style="padding: 18px 18px 8px; border: 1px solid rgba(15,23,42,0.08); border-radius: 16px; background: #ffffff;">
        <h2 style="margin: 0 0 6px; font-size: 20px;">Course Enrollment Confirmation – ${courseName}</h2>
        <p style="margin: 0 0 14px; color: #475569;">
          Hi ${userName || "there"},<br/>
          Thank you for enrolling with <strong>Bharat Skill Development Academy</strong>. We’re excited to have you in <strong>${courseName}</strong>.
        </p>

        <div style="margin: 14px 0; padding: 12px 14px; border-radius: 14px; background: rgba(79,70,229,0.06); border: 1px solid rgba(79,70,229,0.14);">
          <p style="margin: 0; font-weight: 700;">${statusTitle}</p>
          <p style="margin: 6px 0 0; color: #334155;">${statusBody}</p>
        </div>

        <h3 style="margin: 18px 0 8px; font-size: 16px;">Course details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #475569;">Course</td>
            <td style="padding: 8px 0; font-weight: 700; text-align: right;">${courseName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #475569;">Access</td>
            <td style="padding: 8px 0; font-weight: 700; text-align: right;">Login with ${userEmail}</td>
          </tr>
        </table>

        <h3 style="margin: 18px 0 8px; font-size: 16px;">Order summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #475569;">Order ID</td>
            <td style="padding: 8px 0; font-weight: 700; text-align: right;">${orderId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #475569;">Purchase date</td>
            <td style="padding: 8px 0; font-weight: 700; text-align: right;">${purchaseDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #475569;">Payment method</td>
            <td style="padding: 8px 0; font-weight: 700; text-align: right;">${paymentMethod}</td>
          </tr>
          ${refRow}
          <tr>
            <td style="padding: 8px 0; color: #475569;">Discount</td>
            <td style="padding: 8px 0; font-weight: 700; text-align: right;">${Number(discountPct || 0)}%</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: 900;">Total paid</td>
            <td style="padding: 10px 0; font-weight: 900; text-align: right;">${formatInr(amountPaid)}</td>
          </tr>
        </table>

        <h3 style="margin: 18px 0 8px; font-size: 16px;">Next steps</h3>
        <ol style="margin: 0; padding-left: 18px; color: #334155;">
          <li>Open the login page: <a href="${loginUrl}">${loginUrl}</a></li>
          <li>Sign in with: <strong>${userEmail}</strong></li>
          <li>Start learning: <strong>${courseName}</strong></li>
        </ol>

        <p style="margin: 16px 0 0; color: #475569; font-size: 13px;">
          Need help? Reply to this email or contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.
        </p>
      </div>

      <p style="margin: 12px 0 0; text-align: center; color: #64748b; font-size: 12px;">
        © ${new Date().getFullYear()} Bharat Skill Development Academy
      </p>
    </div>
  </div>
  `;
}

async function sendEnrollmentEmail(payload) {
  const { to, subject, html } = payload;
  if (!mailConfigured()) return { sent: false, reason: "Email not configured" };
  const result = await deliverEmail({ to, subject, html });
  if (!result.sent) {
    console.error(`[ORDER] Email send failed: ${result.reason || "unknown"}`);
    return { sent: false, reason: result.reason || "Email send failed" };
  }
  return { sent: true };
}

function makeOrderId() {
  const part = crypto.randomBytes(5).toString("hex").toUpperCase();
  return `BSDA-${part}`;
}

const ORDER_PAYMENT_PAID = "paid";
const ORDER_PAYMENT_PENDING_MANUAL = "pending_manual";
const ORDER_PAYMENT_NOT_PAID = "not_paid";

function isPaidOrderStatus(status) {
  return String(status || "") === ORDER_PAYMENT_PAID;
}

function courseNameFromOrderItems(items) {
  const arr = Array.isArray(items) ? items : [];
  if (arr.length === 0) return "Course";
  if (arr.length === 1) return String(arr[0]?.course?.name || arr[0]?.name || "Course");
  return `${String(arr[0]?.course?.name || arr[0]?.name || "Course")} + ${arr.length - 1} more`;
}

async function sendEnrollmentEmailForOrder(user, order, opts = {}) {
  const courseName = courseNameFromOrderItems(order.items);
  const clientBase = String(process.env.CLIENT_BASE_URL || CLIENT_ORIGINS[0] || "http://localhost:3000").replace(/\/$/, "");
  const loginUrl = `${clientBase}/login`;
  const supportEmail = String(process.env.SUPPORT_EMAIL || mailFrom || smtpUser || "support@example.com");
  const subject = `Course Enrollment Confirmation – ${courseName}`;
  const manualStaff =
    opts.manualStaffVerification === true || Boolean(order.verifiedAt && order.paymentReference);
  const html = buildEnrollmentEmailHtml({
    userName: user.name,
    userEmail: user.email,
    courseName,
    orderId: order.orderId,
    paymentMethod: order.paymentMethod,
    amountPaid: order.amountPaid,
    discountPct: order.discountPct,
    purchaseDate: new Date(order.createdAt).toLocaleString("en-IN"),
    loginUrl,
    supportEmail,
    manualStaffVerification: manualStaff,
    paymentReference: order.paymentReference || null,
  });
  return sendEnrollmentEmail({ to: user.email, subject, html });
}

app.get("/auth/status", (req, res) => {
  res.json({
    ok: true,
    smtpConfigured: Boolean(transporter),
    resendConfigured: Boolean(resendApiKey),
    mailConfigured: mailConfigured(),
    clientOrigins: CLIENT_ORIGINS,
  });
});

app.get("/auth/me", (req, res) => {
  (async () => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ ok: false, error: "Not authenticated" });
    return res.json({ ok: true, user: safeUser(user) });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.post("/auth/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  return res.json({ ok: true });
});

app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body || {};
    const e = normalizeEmail(email);
    const p = String(password || "");
    if (!e || !isEmail(e)) return res.status(400).json({ ok: false, error: "Valid email is required." });
    if (!p || p.length < 6) return res.status(400).json({ ok: false, error: "Password must be at least 6 characters." });

    const passwordHash = await bcrypt.hash(p, 10);
    const user = await prisma.user.create({
      data: {
        name: String(name || "").trim() || null,
        email: e,
        mobile: String(mobile || "").trim() || null,
        passwordHash,
      },
    });

    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    return res.json({ ok: true, user: safeUser(user) });
  } catch (err) {
    if (err && err.code === "P2002") {
      return res.status(409).json({ ok: false, error: "Email is already registered." });
    }
    return res.status(500).json({ ok: false, error: err?.message || "Signup failed." });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const e = normalizeEmail(email);
    const p = String(password || "");
    if (!e || !p) return res.status(400).json({ ok: false, error: "Email and password are required." });

    const user = await prisma.user.findUnique({ where: { email: e } });
    if (!user) return res.status(401).json({ ok: false, error: "Invalid email or password." });

    const ok = await bcrypt.compare(p, user.passwordHash);
    if (!ok) return res.status(401).json({ ok: false, error: "Invalid email or password." });

    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, cookieOptions);
    return res.json({ ok: true, user: safeUser(user) });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || "Login failed." });
  }
});

app.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    const e = normalizeEmail(email);
    if (!e || !isEmail(e)) return res.status(400).json({ ok: false, error: "Valid email is required." });

    const user = await prisma.user.findUnique({ where: { email: e } });
    // Always return ok to avoid user enumeration
    if (!user) return res.json({ ok: true, mode: "noop" });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    // In dev, always link to the running frontend port.
    // In prod, allow CLIENT_BASE_URL to drive the link.
    const preferred = isProd
      ? (process.env.CLIENT_BASE_URL || "").trim() ||
        (CLIENT_ORIGINS[0] || "http://localhost:3000")
      : "http://localhost:3000";

    const resetUrl = `${String(preferred).replace(/\/$/, "")}/forgot-password?token=${rawToken}`;

    const emailResult = await sendResetEmail({ to: e, resetUrl });

    // Development-only: return the generated reset URL so we can verify correct routing.
    if (!isProd) {
      return res.json({ ok: true, mode: "dev_resetUrl", resetUrl, token: rawToken, emailed: emailResult.sent });
    }

    if (!emailResult.sent) {
      return res.json({ ok: true, mode: "queued" });
    }

    return res.json({ ok: true, mode: "email" });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || "Forgot password failed." });
  }
});

app.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    const t = String(token || "").trim();
    const p = String(newPassword || "");
    if (!t) return res.status(400).json({ ok: false, error: "Token is required." });
    if (!p || p.length < 6) return res.status(400).json({ ok: false, error: "Password must be at least 6 characters." });

    const tokenHash = crypto.createHash("sha256").update(t).digest("hex");
    const rec = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!rec) return res.status(400).json({ ok: false, error: "Invalid or expired token." });
    if (new Date() > rec.expiresAt) return res.status(400).json({ ok: false, error: "Invalid or expired token." });

    const passwordHash = await bcrypt.hash(p, 10);
    await prisma.user.update({ where: { id: rec.userId }, data: { passwordHash } });
    await prisma.passwordResetToken.delete({ where: { tokenHash } });

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || "Reset password failed." });
  }
});

// ---------------- Cart (server-side, per user) ----------------
app.get("/cart", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { courseKey: true, course: true, qty: true, updatedAt: true },
    });

    console.log(`[CART] GET user=${user.email} items=${items.length}`);
    return res.json({ ok: true, items });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.put("/cart", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const bodyItems = Array.isArray(req.body?.items) ? req.body.items : null;
    if (!bodyItems) {
      return res.status(400).json({ ok: false, error: "items[] is required." });
    }

    const normalized = [];
    for (const raw of bodyItems) {
      const courseKey = String(raw?.courseKey || raw?.course?.slug || raw?.course?.name || "")
        .trim()
        .toLowerCase();
      const qty = Math.max(1, Number(raw?.qty || 1) || 1);
      const course = raw?.course;
      if (!courseKey || !course || typeof course !== "object") continue;
      normalized.push({ courseKey, qty, course });
    }

    console.log(`[CART] PUT user=${user.email} received=${bodyItems.length} normalized=${normalized.length}`);
    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { userId: user.id } });
      if (normalized.length > 0) {
        await tx.cartItem.createMany({
          data: normalized.map((x) => ({
            userId: user.id,
            courseKey: x.courseKey,
            qty: x.qty,
            course: x.course,
          })),
        });
      }
    });

    console.log(`[CART] PUT saved user=${user.email} items=${normalized.length}`);
    return res.json({ ok: true });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

// ---------------- Orders (complete purchase + email) ----------------
app.post("/orders/complete", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const { items, paymentMethod, amountPaid, discountPct } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: "items[] is required." });
    }

    const method = String(paymentMethod || "").trim();
    if (!/upi/i.test(method)) {
      return res.status(400).json({
        ok: false,
        error: "Only UPI checkout is enabled. Select UPI and submit after paying, or contact support.",
      });
    }

    const amt = Math.max(0, Math.round(Number(amountPaid || 0)));
    const disc = Math.max(0, Math.min(95, Math.round(Number(discountPct || 0))));

    // Prevent duplicate enrollment applications for the same course(s).
    // If the user already has a pending_manual order for a course, block creating another one.
    // If the user is already enrolled (paid order), also block.
    const normalizeCourseKeyFromItem = (it) => {
      const course = it?.course || it || {};
      const direct = String(course?.slug || "").trim().toLowerCase();
      if (direct) return direct;
      const rawName = String(course?.name || it?.name || "");
      return rawName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .trim();
    };

    const requestedKeys = new Set(
      items
        .map(normalizeCourseKeyFromItem)
        .filter((k) => Boolean(k))
        .map((k) => String(k).toLowerCase())
    );

    if (requestedKeys.size === 0) {
      return res.status(400).json({ ok: false, error: "Could not determine course keys from cart items." });
    }

    const existingRelevantOrders = await prisma.order.findMany({
      where: {
        userId: user.id,
        paymentStatus: { in: [ORDER_PAYMENT_PAID, ORDER_PAYMENT_PENDING_MANUAL] },
      },
      orderBy: { createdAt: "desc" },
      select: { paymentStatus: true, items: true },
    });

    const matchedStatusByKey = new Map(); // courseKey -> status (first match wins due to desc order)
    for (const o of existingRelevantOrders) {
      const cartItems = Array.isArray(o.items) ? o.items : [];
      for (const it of cartItems) {
        const ck = normalizeCourseKeyFromItem(it);
        if (!ck || !requestedKeys.has(ck)) continue;
        if (!matchedStatusByKey.has(ck)) matchedStatusByKey.set(ck, o.paymentStatus);
      }
    }

    if (matchedStatusByKey.size > 0) {
      const courseLabel = courseNameFromOrderItems(items);
      const hasPaid = Array.from(matchedStatusByKey.values()).some((s) => s === ORDER_PAYMENT_PAID);
      return res.status(409).json({
        ok: false,
        error: hasPaid
          ? `You are already enrolled for ${courseLabel}.`
          : `You already applied for ${courseLabel}. Please check your Orders for admin verification.`,
      });
    }

    const orderId = makeOrderId();
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderId,
        paymentMethod: method,
        paymentStatus: ORDER_PAYMENT_PENDING_MANUAL,
        amountPaid: amt,
        discountPct: disc,
        items,
      },
    });

    if (order.paymentStatus !== ORDER_PAYMENT_PENDING_MANUAL) {
      console.error(
        `[ORDER] Unexpected paymentStatus=${order.paymentStatus} for new UPI order=${orderId} — enrollment email must stay disabled until admin verify.`
      );
    }

    console.log(
      `[ORDER] UPI request recorded (pending verification, enrollment email NOT sent) user=${user.email} order=${orderId} amount=${amt}`
    );

    await prisma.cartItem.deleteMany({ where: { userId: user.id } });

    return res.json({
      ok: true,
      orderId,
      paymentStatus: ORDER_PAYMENT_PENDING_MANUAL,
      email: "skipped",
      emailReason: "Payment not verified yet — staff will confirm UPI receipt before sending enrollment email.",
      emailedTo: null,
    });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

// ---------------- Enrollments + Orders + Support (Phase 1) ----------------
const slugify = (name) =>
  String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function userHasCourse({ userId, courseKey }) {
  const orders = await prisma.order.findMany({
    where: { userId, paymentStatus: ORDER_PAYMENT_PAID },
    orderBy: { createdAt: "desc" },
    select: { items: true },
  });
  const ck = String(courseKey || "").trim().toLowerCase();
  for (const o of orders) {
    const arr = Array.isArray(o.items) ? o.items : [];
    for (const it of arr) {
      const course = it?.course || it || {};
      const key = String(course?.slug || slugify(course?.name || it?.name || "")).trim().toLowerCase();
      if (key && key === ck) return true;
    }
  }
  return false;
}

// ---------------- Protected course video streaming ----------------
// Store large video files outside the SPA public folder, e.g.:
//   server/private-videos/AI Fundamentals/WEEK 1/....
const PRIVATE_VIDEOS_ROOT = path.join(__dirname, "private-videos");
const COURSE_VIDEO_DIRS = {
  // courseKey -> directory under PRIVATE_VIDEOS_ROOT (match your folder names exactly)
  "ai-foundations-for-beginners": "AI Fundamentals",
  "python-for-ai-beginner-level": "Python for AI – Beginner Level",
  // Automation & Robotics (industry40Catalog) — folder names as on disk
  "introduction-to-automation-and-robotics": "Introduction to Automation and Robotics",
  "industrial-safety-standards": "Industrial Safety & Standards",
};

function resolveCourseVideoRoot(courseKey) {
  const ck = String(courseKey || "").trim().toLowerCase();
  const mapped = COURSE_VIDEO_DIRS[ck];
  const candidates = [mapped, ck].filter(Boolean);

  // Pick the first existing directory; otherwise fall back to the first candidate.
  for (const dir of candidates) {
    const absRoot = path.resolve(PRIVATE_VIDEOS_ROOT, dir);
    if (fs.existsSync(absRoot)) {
      return { ck, dir, absRoot };
    }
  }

  const dir = candidates[0] || ck; // default convention: folder name == courseKey
  return {
    ck,
    dir,
    absRoot: path.resolve(PRIVATE_VIDEOS_ROOT, dir),
  };
}

function guessVideoContentType(filePath) {
  const ext = String(path.extname(filePath) || "").toLowerCase();
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".webm") return "video/webm";
  if (ext === ".mov") return "video/quicktime";
  return "application/octet-stream";
}

function isVideoExt(name) {
  const ext = String(path.extname(name || "")).toLowerCase();
  return ext === ".mp4" || ext === ".webm" || ext === ".mov";
}

function titleFromFilename(name) {
  const base = String(name || "").replace(/\.(mp4|webm|mov)$/i, "");
  return base
    .replace(/_+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function leadingOrderNumber(name) {
  const s = String(name || "").trim();
  const m = s.match(/^(\d{1,4})[\s._-]+/);
  return m ? Number(m[1]) : null;
}

function loadVideoIndexForCourse(courseKey) {
  const { absRoot } = resolveCourseVideoRoot(courseKey);
  if (!fs.existsSync(absRoot)) return { weeks: [], total: 0 };

  const dirents = fs.readdirSync(absRoot, { withFileTypes: true });
  const weekDirs = dirents.filter((d) => d.isDirectory()).map((d) => d.name);

  const weeks = [];
  let total = 0;

  for (const weekName of weekDirs) {
    const weekPath = path.join(absRoot, weekName);
    let files = [];
    try {
      files = fs.readdirSync(weekPath, { withFileTypes: true })
        .filter((d) => d.isFile() && isVideoExt(d.name))
        .map((d) => d.name);
    } catch {
      files = [];
    }
    if (!files.length) continue;

    const entries = files
      .map((name) => {
        let mtimeMs = 0;
        try {
          mtimeMs = fs.statSync(path.join(weekPath, name)).mtimeMs || 0;
        } catch {
          mtimeMs = 0;
        }
        return { name, mtimeMs, order: leadingOrderNumber(name) };
      })
      .sort((a, b) => {
        const ao = a.order;
        const bo = b.order;
        if (ao != null && bo != null && ao !== bo) return ao - bo;
        if (ao != null && bo == null) return -1;
        if (ao == null && bo != null) return 1;
        if (a.mtimeMs !== b.mtimeMs) return a.mtimeMs - b.mtimeMs;
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
      });

    total += entries.length;
    weeks.push({
      label: weekName,
      items: entries.map((e) => ({
        path: `${weekName}/${e.name}`.replace(/\\/g, "/"),
        title: titleFromFilename(e.name),
      })),
    });
  }

  weeks.sort((a, b) => {
    const ma = String(a.label).match(/(\d+)/);
    const mb = String(b.label).match(/(\d+)/);
    if (ma && mb) return Number(ma[1]) - Number(mb[1]);
    return String(a.label).localeCompare(String(b.label), undefined, { numeric: true, sensitivity: "base" });
  });

  return { weeks, total };
}

// Returns week-wise index for a paid user (used by frontend to reflect videos automatically).
app.get("/videos/:courseKey/index", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const courseKey = String(req.params?.courseKey || "").trim().toLowerCase();
    if (!courseKey) return res.status(400).json({ ok: false, error: "Missing courseKey." });

    const paid = await userHasCourse({ userId: user.id, courseKey });
    if (!paid) return res.status(403).json({ ok: false, error: "Payment required." });

    const { absRoot } = resolveCourseVideoRoot(courseKey);
    if (!fs.existsSync(absRoot)) {
      return res.status(404).json({ ok: false, error: "Video folder not found." });
    }

    const { weeks } = loadVideoIndexForCourse(courseKey);
    return res.json({ ok: true, weeks });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.get("/video/:courseKey", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const courseKey = String(req.params?.courseKey || "").trim().toLowerCase();
    const rel = String(req.query?.path || "").trim();

    if (!courseKey) return res.status(400).json({ ok: false, error: "Missing courseKey." });
    if (!rel) return res.status(400).json({ ok: false, error: "Missing path." });

    const paid = await userHasCourse({ userId: user.id, courseKey });
    // Use 403 so browsers/devtools show a standard forbidden response for media.
    if (!paid) return res.status(403).send("Payment required.");

    const { absRoot: absRootResolved } = resolveCourseVideoRoot(courseKey);

    // Prevent path traversal.
    const sanitized = rel.replace(/^([/\\])+/, "");
    if (sanitized.includes("..")) return res.status(400).json({ ok: false, error: "Invalid path." });

    const absRoot = absRootResolved;
    const absFile = path.resolve(absRoot, sanitized);
    if (!absFile.startsWith(absRoot)) return res.status(400).json({ ok: false, error: "Invalid path." });

    let stat;
    try {
      stat = fs.statSync(absFile);
    } catch {
      return res.status(404).send("Video not found.");
    }
    if (!stat.isFile()) return res.status(404).send("Video not found.");

    const total = stat.size;
    const range = req.headers.range;
    const contentType = guessVideoContentType(absFile);

    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Type", contentType);
    // Allow browser to read range headers in cross-origin setups (also fine same-origin).
    res.setHeader("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges, Content-Length");

    if (range) {
      const m = String(range).match(/bytes=(\d*)-(\d*)/);
      if (!m) return res.status(416).end();
      const start = m[1] ? Number(m[1]) : 0;
      const end = m[2] ? Number(m[2]) : Math.min(total - 1, start + 1024 * 1024 * 4); // 4MB chunk default
      if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= total) {
        return res.status(416).end();
      }

      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${total}`);
      res.setHeader("Content-Length", String(end - start + 1));
      return fs.createReadStream(absFile, { start, end }).pipe(res);
    }

    res.setHeader("Content-Length", String(total));
    return fs.createReadStream(absFile).pipe(res);
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

// ---------------- Final Test + Certificate ----------------
const PDFDocument = require("pdfkit");

const FINAL_TEST_BANK = {
  "ai-foundations-for-beginners": {
    quizTitle: "AI Fundamentals Final Assessment",
    passPercentage: 70,
    maxAttempts: 3,
    durationSec: 10 * 60,
    questions: [
      {
        id: 1,
        question: "What is Artificial Intelligence?",
        options: [
          "Machines performing tasks with human intelligence",
          "Only computer programming",
          "Only data storage",
          "Internet technology",
        ],
        answer: 0,
      },
      {
        id: 2,
        question: "Which of the following is an example of AI?",
        options: ["Calculator", "Netflix recommendation", "Keyboard typing", "USB drive"],
        answer: 1,
      },
      { id: 3, question: "AI learns from?", options: ["Code only", "Data", "Internet speed", "Hardware"], answer: 1 },
      {
        id: 4,
        question: "Machine Learning is a subset of?",
        options: ["Data Science", "Artificial Intelligence", "Programming", "Networking"],
        answer: 1,
      },
      {
        id: 5,
        question: "Which type of AI is currently used?",
        options: ["General AI", "Narrow AI", "Super AI", "Human AI"],
        answer: 1,
      },
      {
        id: 6,
        question: "Structured data is?",
        options: ["Organized in rows and columns", "Images and videos", "Audio files", "Random text"],
        answer: 0,
      },
      { id: 7, question: "Unstructured data example?", options: ["Excel sheet", "Database", "Images", "Table"], answer: 2 },
      { id: 8, question: "What is dataset?", options: ["Single value", "Collection of data", "Only images", "Only numbers"], answer: 1 },
      {
        id: 9,
        question: "Which step comes first in data lifecycle?",
        options: ["Processing", "Output", "Collection", "Prediction"],
        answer: 2,
      },
      { id: 10, question: "Machine Learning helps in?", options: ["Learning from data", "Typing faster", "Storage", "Internet speed"], answer: 0 },
      { id: 11, question: "Supervised learning uses?", options: ["No data", "Labeled data", "Random data", "Images only"], answer: 1 },
      { id: 12, question: "Unsupervised learning is?", options: ["With labels", "Without labels", "Only coding", "Only prediction"], answer: 1 },
      {
        id: 13,
        question: "Spam detection is example of?",
        options: ["Unsupervised learning", "Supervised learning", "No learning", "Manual process"],
        answer: 1,
      },
      { id: 14, question: "Recommendation systems are used in?", options: ["Netflix", "Calculator", "Keyboard", "Mouse"], answer: 0 },
      { id: 15, question: "Algorithm is?", options: ["Final result", "Learning method", "Data", "Output"], answer: 1 },
      { id: 16, question: "Model is?", options: ["Learning method", "Final trained output", "Data", "Input"], answer: 1 },
      {
        id: 17,
        question: "AI thinking approach includes?",
        options: ["Problem → Data → Pattern → Prediction", "Only coding", "Only data", "Only output"],
        answer: 0,
      },
      { id: 18, question: "Better data leads to?", options: ["Worse results", "Better results", "No change", "Slow system"], answer: 1 },
      { id: 19, question: "Which tool is used for no-code AI?", options: ["Teachable Machine", "Notepad", "Calculator", "Excel"], answer: 0 },
      { id: 20, question: "Python is used for?", options: ["AI and ML", "Cooking", "Driving", "Painting"], answer: 0 },
    ],
  },
  "python-for-ai-beginner-level": {
    quizTitle: "Python for AI - Final Test",
    passPercentage: 70,
    maxAttempts: 3,
    durationSec: 10 * 60,
    questions: [
      {
        id: 1,
        question: "What is Python?",
        options: ["A programming language", "A database", "An operating system", "A web browser"],
        answer: 0,
      },
      {
        id: 2,
        question: "Which symbol is used for comments in Python?",
        options: ["//", "#", "/* */", "<!-- -->"],
        answer: 1,
      },
      {
        id: 3,
        question: "Which data type is used to store True or False values?",
        options: ["String", "Integer", "Boolean", "List"],
        answer: 2,
      },
      {
        id: 4,
        question: "Which Python library is commonly used for numerical computing?",
        options: ["NumPy", "React", "Express", "MongoDB"],
        answer: 0,
      },
      {
        id: 5,
        question: "What does AI stand for?",
        options: ["Artificial Intelligence", "Automated Internet", "Advanced Input", "Application Interface"],
        answer: 0,
      },
      {
        id: 6,
        question: "What is Machine Learning?",
        options: [
          "A way for computers to learn from data",
          "A hardware device",
          "A type of monitor",
          "A file format",
        ],
        answer: 0,
      },
      {
        id: 7,
        question: "Which library is used for data analysis in Python?",
        options: ["Pandas", "CSS", "HTML", "Bootstrap"],
        answer: 0,
      },
      {
        id: 8,
        question: "Which function is used to display output in Python?",
        options: ["print()", "show()", "display()", "output()"],
        answer: 0,
      },
      {
        id: 9,
        question: "What is a dataset?",
        options: ["Collection of data", "A Python keyword", "A computer virus", "A web page"],
        answer: 0,
      },
      {
        id: 10,
        question: "Which of these is an example of AI?",
        options: ["Chatbot", "Keyboard", "Mouse", "Printer"],
        answer: 0,
      },
    ],
  },
};

function getFinalTestDurationSec(bank) {
  const n = Number(bank?.durationSec);
  if (Number.isFinite(n) && n > 0) return Math.round(n);
  return 10 * 60;
}

function evaluateQuiz(questions, userAnswers, passPercentage) {
  let score = 0;
  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i];
    if (userAnswers?.[i] === q.answer) score += 1;
  }
  const total = questions.length;
  const percentage = total ? (score / total) * 100 : 0;
  const passed = percentage >= passPercentage;
  return { score, total, percentage, passed };
}

async function getVideoCompletionState({ userId, courseKey }) {
  const progress = await prisma.courseProgress.findUnique({
    where: { userId_courseKey: { userId, courseKey } },
    select: { completedLessonKeys: true, totalLessons: true },
  });
  const { total: serverTotal } = loadVideoIndexForCourse(courseKey);
  const completedAll = Array.isArray(progress?.completedLessonKeys) ? progress.completedLessonKeys.map((x) => String(x)) : [];
  const completed = serverTotal > 0 ? completedAll.filter((k) => k.startsWith("video:")) : completedAll;
  const completedCount = new Set(completed).size;

  const totalLessons = Math.max(Number(progress?.totalLessons || 0), Number(serverTotal || 0));
  const unlocked = totalLessons > 0 && completedCount >= totalLessons;
  return { unlocked, completedCount, totalLessons };
}

app.get("/final-test/:courseKey", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const courseKey = String(req.params?.courseKey || "").trim().toLowerCase();
    const bank = FINAL_TEST_BANK[courseKey];
    if (!bank) return res.status(404).json({ ok: false, error: "Final test not configured." });

    const paid = await userHasCourse({ userId: user.id, courseKey });
    if (!paid) return res.status(403).json({ ok: false, error: "Payment required." });

    const attemptsUsed = await prisma.finalTestAttempt.count({ where: { userId: user.id, courseKey } });
    const cert = await prisma.courseCertificate.findUnique({
      where: { userId_courseKey: { userId: user.id, courseKey } },
      select: { certCode: true, issuedAt: true },
    });
    const completion = await getVideoCompletionState({ userId: user.id, courseKey });

    const alreadyPassed = Boolean(cert);
    const questionsSafe = bank.questions.map((q) => ({ id: q.id, question: q.question, options: q.options }));
    return res.json({
      ok: true,
      quizTitle: bank.quizTitle,
      passPercentage: bank.passPercentage,
      maxAttempts: bank.maxAttempts,
      durationSec: getFinalTestDurationSec(bank),
      attemptsUsed,
      unlocked: completion.unlocked,
      completion,
      alreadyPassed,
      certificate: cert || null,
      questions: questionsSafe,
    });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.post("/final-test/:courseKey/start", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const courseKey = String(req.params?.courseKey || "").trim().toLowerCase();
    const bank = FINAL_TEST_BANK[courseKey];
    if (!bank) return res.status(404).json({ ok: false, error: "Final test not configured." });

    const paid = await userHasCourse({ userId: user.id, courseKey });
    if (!paid) return res.status(403).json({ ok: false, error: "Payment required." });

    const completion = await getVideoCompletionState({ userId: user.id, courseKey });
    if (!completion.unlocked) return res.status(403).json({ ok: false, error: "Final test locked until videos are completed." });

    const existingCert = await prisma.courseCertificate.findUnique({
      where: { userId_courseKey: { userId: user.id, courseKey } },
      select: { certCode: true, issuedAt: true },
    });
    if (existingCert) return res.json({ ok: true, alreadyPassed: true, certificate: existingCert });

    const attemptsUsed = await prisma.finalTestAttempt.count({ where: { userId: user.id, courseKey } });
    if (attemptsUsed >= bank.maxAttempts) {
      return res.status(429).json({ ok: false, error: `Max attempts reached (${bank.maxAttempts}).` });
    }

    const durationSec = getFinalTestDurationSec(bank);
    const startedAtMs = Date.now();
    const token = jwt.sign(
      { kind: "final_test", sub: user.id, courseKey, startedAtMs, durationSec },
      JWT_SECRET,
      { expiresIn: Math.max(30, durationSec + 30) } // small grace for network
    );
    return res.json({
      ok: true,
      sessionToken: token,
      startedAtMs,
      durationSec,
      expiresAtMs: startedAtMs + durationSec * 1000,
      attemptsUsed,
      maxAttempts: bank.maxAttempts,
    });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.post("/final-test/:courseKey/submit", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const courseKey = String(req.params?.courseKey || "").trim().toLowerCase();
    const bank = FINAL_TEST_BANK[courseKey];
    if (!bank) return res.status(404).json({ ok: false, error: "Final test not configured." });

    const paid = await userHasCourse({ userId: user.id, courseKey });
    if (!paid) return res.status(403).json({ ok: false, error: "Payment required." });

    const completion = await getVideoCompletionState({ userId: user.id, courseKey });
    if (!completion.unlocked) return res.status(403).json({ ok: false, error: "Final test locked until videos are completed." });

    const existingCert = await prisma.courseCertificate.findUnique({
      where: { userId_courseKey: { userId: user.id, courseKey } },
      select: { certCode: true, issuedAt: true },
    });
    if (existingCert) {
      return res.json({ ok: true, alreadyPassed: true, certificate: existingCert });
    }

    const attemptsUsed = await prisma.finalTestAttempt.count({ where: { userId: user.id, courseKey } });
    if (attemptsUsed >= bank.maxAttempts) {
      return res.status(429).json({ ok: false, error: `Max attempts reached (${bank.maxAttempts}).` });
    }

    const sessionToken = String(req.body?.sessionToken || "").trim();
    if (!sessionToken) return res.status(400).json({ ok: false, error: "Missing session token." });
    let payload;
    try {
      payload = jwt.verify(sessionToken, JWT_SECRET);
    } catch {
      return res.status(403).json({ ok: false, error: "Session expired. Please restart the test." });
    }
    if (payload?.kind !== "final_test") return res.status(403).json({ ok: false, error: "Invalid session." });
    if (String(payload?.sub || "") !== String(user.id || "")) return res.status(403).json({ ok: false, error: "Invalid session." });
    if (String(payload?.courseKey || "") !== String(courseKey || "")) return res.status(403).json({ ok: false, error: "Invalid session." });

    const durationSec = getFinalTestDurationSec(bank);
    const startedAtMs = Number(payload?.startedAtMs || 0);
    if (!Number.isFinite(startedAtMs) || startedAtMs <= 0) return res.status(403).json({ ok: false, error: "Invalid session." });
    const now = Date.now();
    if (now > startedAtMs + durationSec * 1000 + 5000) {
      return res.status(403).json({ ok: false, error: "Time is over. Please restart the test." });
    }

    const userAnswers = Array.isArray(req.body?.userAnswers) ? req.body.userAnswers : [];
    const result = evaluateQuiz(bank.questions, userAnswers, bank.passPercentage);

    await prisma.finalTestAttempt.create({
      data: {
        userId: user.id,
        courseKey,
        scorePct: Math.round(result.percentage),
        passed: Boolean(result.passed),
        answers: { userAnswers },
      },
    });

    let certificate = null;
    if (result.passed) {
      const certCode = `BSA-${String(courseKey).slice(0, 4).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      const row = await prisma.courseCertificate.upsert({
        where: { userId_courseKey: { userId: user.id, courseKey } },
        update: { certCode, issuedAt: new Date() },
        create: { userId: user.id, courseKey, certCode, issuedAt: new Date() },
        select: { certCode: true, issuedAt: true },
      });
      certificate = row;
    }

    return res.json({
      ok: true,
      result: {
        score: result.score,
        total: result.total,
        percentage: Math.round(result.percentage),
        passed: Boolean(result.passed),
      },
      attemptsUsed: attemptsUsed + 1,
      maxAttempts: bank.maxAttempts,
      certificate,
    });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.get("/certificate/:courseKey/download", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const courseKey = String(req.params?.courseKey || "").trim().toLowerCase();
    const paid = await userHasCourse({ userId: user.id, courseKey });
    if (!paid) return res.status(403).send("Payment required.");

    const cert = await prisma.courseCertificate.findUnique({
      where: { userId_courseKey: { userId: user.id, courseKey } },
      select: { certCode: true, issuedAt: true },
    });
    if (!cert) return res.status(404).send("Certificate not found.");

    const displayCourse = courseKey
      .split("-")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"certificate-${courseKey}.pdf\"`);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    doc.rect(20, 20, 555, 802).lineWidth(2).stroke("#1e293b");
    doc.fontSize(24).fillColor("#0f172a").text("Bharat Skill Academy", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(18).fillColor("#334155").text("Certificate of Completion", { align: "center" });
    doc.moveDown(1.5);

    doc.fontSize(12).fillColor("#475569").text("This is to certify that", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(22).fillColor("#0f172a").text(String(user.name || user.email || "Learner"), { align: "center" });
    doc.moveDown(0.8);
    doc.fontSize(12).fillColor("#475569").text("has successfully passed the final assessment for", { align: "center" });
    doc.moveDown(0.4);
    doc.fontSize(18).fillColor("#0f172a").text(displayCourse, { align: "center" });
    doc.moveDown(2);

    doc.fontSize(12).fillColor("#334155").text(`Certificate Code: ${cert.certCode}`, { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(12).fillColor("#334155").text(`Issued: ${new Date(cert.issuedAt).toLocaleDateString("en-IN")}`, { align: "center" });

    doc.moveDown(4);
    doc.fontSize(10).fillColor("#64748b").text("This certificate is system-generated.", { align: "center" });

    doc.end();
  })().catch(() => res.status(500).send("Failed."));
});

function maskMobile(mobile) {
  const s = String(mobile || "").replace(/\s+/g, "");
  if (s.length <= 4) return s;
  return `${s.slice(0, 2)}******${s.slice(-2)}`;
}

const ADMIN_EMAILS = String(process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

if (!ADMIN_EMAILS.length && isProd) {
  console.warn(
    "[config] ADMIN_EMAIL / ADMIN_EMAILS is empty — the Admin navbar link and /api/admin/* will treat everyone as non-admin. Set ADMIN_EMAIL on your host (Render/VPS/etc.); local server/.env is not deployed automatically."
  );
} else if (ADMIN_EMAILS.length) {
  console.log(`[config] Admin allowlist: ${ADMIN_EMAILS.length} address(es) configured.`);
}

async function requireAdmin(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return null;
  if (!ADMIN_EMAILS.length) {
    res.status(403).json({ ok: false, error: "Admin not configured." });
    return null;
  }
  if (!ADMIN_EMAILS.includes(String(user.email || "").toLowerCase())) {
    res.status(403).json({ ok: false, error: "Not authorized." });
    return null;
  }
  return user;
}

// Used by frontend to hide/show Admin link in navbar.
app.get("/auth/is-admin", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) {
      return res.status(401).json({ ok: false, error: "Not authenticated" });
    }
    const isAdmin = ADMIN_EMAILS.includes(String(user.email || "").toLowerCase());
    return res.json({ ok: true, isAdmin });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.get("/enrollments", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const orders = await prisma.order.findMany({
      where: { userId: user.id, paymentStatus: ORDER_PAYMENT_PAID },
      orderBy: { createdAt: "desc" },
      select: { orderId: true, paymentMethod: true, amountPaid: true, discountPct: true, createdAt: true, items: true },
    });

    const seen = new Map(); // courseKey -> enrollment (latest wins because orders are desc)
    for (const o of orders) {
      const cartItems = Array.isArray(o.items) ? o.items : [];
      for (const it of cartItems) {
        const course = it?.course || it || {};
        const courseKey = String(course?.slug || slugify(course?.name || it?.name || "")).trim().toLowerCase();
        if (!courseKey) continue;
        if (seen.has(courseKey)) continue;

        seen.set(courseKey, {
          courseKey,
          courseName: String(course?.name || it?.name || "Course"),
          price: Number(course?.price || it?.price || 0),
          orderId: o.orderId,
          paymentMethod: o.paymentMethod,
          amountPaid: o.amountPaid,
          discountPct: o.discountPct,
          purchaseDate: o.createdAt,
        });
      }
    }

    return res.json({ ok: true, enrollments: Array.from(seen.values()) });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.get("/orders", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        orderId: true,
        paymentMethod: true,
        paymentStatus: true,
        amountPaid: true,
        discountPct: true,
        createdAt: true,
        items: true,
        verifiedAt: true,
        verifiedByEmail: true,
        paymentReference: true,
      },
    });

    return res.json({ ok: true, orders });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.post("/notifications/reminder", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const courseKey = String(req.body?.courseKey || "").trim().toLowerCase();
    const courseName = String(req.body?.courseName || "").trim();
    if (!courseKey || !courseName) {
      return res.status(400).json({ ok: false, error: "courseKey and courseName are required." });
    }

    const clientBase = String(process.env.CLIENT_BASE_URL || CLIENT_ORIGINS[0] || "http://localhost:3000").replace(/\/$/, "");
    const loginUrl = `${clientBase}/login`;
    const subject = `Reminder: Continue learning – ${courseName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#0f172a;">
        <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden;">
          <div style="padding:18px 22px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%); color:#fff;">
            <div style="font-size:14px; opacity:0.95; font-weight:700;">Bharat Skill Development Academy</div>
            <div style="font-size:20px; font-weight:800; margin-top:2px;">Learning reminder</div>
          </div>
          <div style="padding:22px;">
            <p style="margin:0 0 10px;">Hi <strong>${String(user.name || user.email)}</strong>,</p>
            <p style="margin:0 0 14px;">Just a quick reminder to continue your course:</p>
            <p style="margin:0 0 14px; font-weight:900; font-size:16px;">${courseName}</p>
            <p style="margin:0 0 14px;">
              Login to your account and continue learning:
              <a href="${loginUrl}" style="color:#4f46e5; font-weight:800; text-decoration:none;">${loginUrl}</a>
            </p>
            <p style="margin: 16px 0 0; color:#475569; font-size: 13px;">
              Need help? Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.
            </p>
          </div>
        </div>
      </div>
    `;

    const emailResult = await sendEnrollmentEmail({ to: user.email, subject, html });
    return res.json({ ok: true, email: emailResult.sent ? "sent" : "not_sent" });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

// ---------------- Wishlist (server-side) ----------------
app.get("/wishlist", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const items = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { courseKey: true, course: true, createdAt: true },
    });
    return res.json({ ok: true, items });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.post("/wishlist", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const course = req.body?.course;
    const courseKey = String(req.body?.courseKey || course?.slug || course?.name || "").trim().toLowerCase();
    if (!courseKey || !course || typeof course !== "object") {
      return res.status(400).json({ ok: false, error: "courseKey and course are required." });
    }

    await prisma.wishlistItem.upsert({
      where: { userId_courseKey: { userId: user.id, courseKey } },
      update: { course },
      create: { userId: user.id, courseKey, course },
    });
    return res.json({ ok: true });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.delete("/wishlist/:courseKey", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const courseKey = String(req.params?.courseKey || "").trim().toLowerCase();
    if (!courseKey) return res.status(400).json({ ok: false, error: "courseKey is required." });
    await prisma.wishlistItem.deleteMany({ where: { userId: user.id, courseKey } });
    return res.json({ ok: true });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

// ---------------- Progress ----------------
app.get("/progress/summary", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const rows = await prisma.courseProgress.findMany({
      where: { userId: user.id },
      select: { courseKey: true, completedLessonKeys: true, totalLessons: true, updatedAt: true },
    });
    return res.json({ ok: true, rows });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.get("/progress/:courseKey", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;
    const courseKey = String(req.params?.courseKey || "").trim().toLowerCase();
    if (!courseKey) return res.status(400).json({ ok: false, error: "courseKey is required." });

    const row = await prisma.courseProgress.findUnique({
      where: { userId_courseKey: { userId: user.id, courseKey } },
      select: { courseKey: true, completedLessonKeys: true, totalLessons: true, updatedAt: true },
    });
    return res.json({ ok: true, row: row || null });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.put("/progress/:courseKey", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;
    const courseKey = String(req.params?.courseKey || "").trim().toLowerCase();
    const lessonKey = String(req.body?.lessonKey || "").trim();
    const completed = Boolean(req.body?.completed);
    const totalLessonsIncoming = Number(req.body?.totalLessons || 0) || 0;
    if (!courseKey || !lessonKey) {
      return res.status(400).json({ ok: false, error: "courseKey and lessonKey are required." });
    }

    const ok = await userHasCourse({ userId: user.id, courseKey });
    if (!ok) return res.status(403).json({ ok: false, error: "Not enrolled in this course." });

    const existing = await prisma.courseProgress.findUnique({
      where: { userId_courseKey: { userId: user.id, courseKey } },
      select: { completedLessonKeys: true, totalLessons: true },
    });
    const arr = Array.isArray(existing?.completedLessonKeys) ? existing.completedLessonKeys : [];
    const set = new Set(arr.map((x) => String(x)));
    if (completed) set.add(lessonKey);
    else set.delete(lessonKey);
    const next = Array.from(set.values());
    const nextTotalLessons = Math.max(
      Number(existing?.totalLessons || 0) || 0,
      totalLessonsIncoming > 0 ? Math.floor(totalLessonsIncoming) : 0
    );

    const row = await prisma.courseProgress.upsert({
      where: { userId_courseKey: { userId: user.id, courseKey } },
      update: { completedLessonKeys: next, totalLessons: nextTotalLessons },
      create: { userId: user.id, courseKey, completedLessonKeys: next, totalLessons: nextTotalLessons },
      select: { courseKey: true, completedLessonKeys: true, totalLessons: true, updatedAt: true },
    });
    return res.json({ ok: true, row });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

// ---------------- Reviews (verified purchase) ----------------
app.get("/reviews/:courseKey", (req, res) => {
  (async () => {
    const courseKey = String(req.params?.courseKey || "").trim().toLowerCase();
    if (!courseKey) return res.status(400).json({ ok: false, error: "courseKey is required." });

    const rows = await prisma.courseReview.findMany({
      where: { courseKey },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { rating: true, title: true, body: true, createdAt: true, userId: true },
    });

    const avg =
      rows.length > 0 ? rows.reduce((s, r) => s + Number(r.rating || 0), 0) / rows.length : 0;
    return res.json({ ok: true, avgRating: avg, count: rows.length, reviews: rows });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.post("/reviews/:courseKey", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;
    const courseKey = String(req.params?.courseKey || "").trim().toLowerCase();
    const rating = Math.max(1, Math.min(5, Math.round(Number(req.body?.rating || 0) || 0)));
    const title = req.body?.title != null ? String(req.body.title).trim() : null;
    const body = req.body?.body != null ? String(req.body.body).trim() : null;
    if (!courseKey) return res.status(400).json({ ok: false, error: "courseKey is required." });
    if (!rating) return res.status(400).json({ ok: false, error: "rating is required." });

    const ok = await userHasCourse({ userId: user.id, courseKey });
    if (!ok) return res.status(403).json({ ok: false, error: "Only enrolled learners can review." });

    await prisma.courseReview.upsert({
      where: { userId_courseKey: { userId: user.id, courseKey } },
      update: { rating, title, body },
      create: { userId: user.id, courseKey, rating, title, body },
    });
    return res.json({ ok: true });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.post("/reviews/summary", (req, res) => {
  (async () => {
    const keys = Array.isArray(req.body?.courseKeys) ? req.body.courseKeys : [];
    const courseKeys = keys.map((k) => String(k || "").trim().toLowerCase()).filter(Boolean);
    if (courseKeys.length === 0) return res.json({ ok: true, summary: {} });

    const rows = await prisma.courseReview.findMany({
      where: { courseKey: { in: courseKeys } },
      select: { courseKey: true, rating: true },
    });

    const agg = new Map();
    for (const r of rows) {
      const k = String(r.courseKey);
      const curr = agg.get(k) || { sum: 0, count: 0 };
      curr.sum += Number(r.rating || 0);
      curr.count += 1;
      agg.set(k, curr);
    }
    const summary = {};
    for (const [k, v] of agg.entries()) {
      summary[k] = { avg: v.count ? v.sum / v.count : 0, count: v.count };
    }

    return res.json({ ok: true, summary });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

// ---------------- Announcements + In-app Notifications ----------------
app.get("/announcements", (req, res) => {
  (async () => {
    const take = Math.min(50, Math.max(1, Number(req.query?.take || 20) || 20));
    const now = new Date();
    const rows = await prisma.announcement.findMany({
      where: { publishAt: { lte: now } },
      orderBy: { publishAt: "desc" },
      take,
      select: { id: true, title: true, body: true, kind: true, publishAt: true },
    });
    return res.json({ ok: true, announcements: rows });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.get("/notifications/summary", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const state = await prisma.userNotificationState.findUnique({
      where: { userId: user.id },
      select: { announcementsSeenAt: true },
    });
    const seenAt = state?.announcementsSeenAt || new Date(0);

    const now = new Date();
    const unreadCount = await prisma.announcement.count({
      where: { publishAt: { lte: now, gt: seenAt } },
    });
    const latest = await prisma.announcement.findMany({
      where: { publishAt: { lte: now } },
      orderBy: { publishAt: "desc" },
      take: 10,
      select: { id: true, title: true, kind: true, publishAt: true },
    });

    return res.json({ ok: true, unreadCount, latest, seenAt });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.post("/notifications/seen", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;
    const at = new Date();
    await prisma.userNotificationState.upsert({
      where: { userId: user.id },
      update: { announcementsSeenAt: at },
      create: { userId: user.id, announcementsSeenAt: at },
    });
    return res.json({ ok: true });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.post("/admin/announcements", (req, res) => {
  (async () => {
    const user = await requireAdmin(req, res);
    if (!user) return;

    const title = String(req.body?.title || "").trim();
    const body = String(req.body?.body || "").trim();
    const kind = String(req.body?.kind || "update").trim().toLowerCase();
    if (!title || title.length < 3) return res.status(400).json({ ok: false, error: "title is required." });
    if (!body || body.length < 3) return res.status(400).json({ ok: false, error: "body is required." });

    const publishAt = req.body?.publishAt ? new Date(req.body.publishAt) : new Date();
    const a = await prisma.announcement.create({
      data: { title, body, kind, publishAt },
      select: { id: true, title: true, body: true, kind: true, publishAt: true },
    });
    return res.json({ ok: true, announcement: a });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.post("/admin/announcements/:id/send-email", (req, res) => {
  (async () => {
    const user = await requireAdmin(req, res);
    if (!user) return;
    if (!mailConfigured()) return res.status(400).json({ ok: false, error: "Email not configured (set RESEND_API_KEY or SMTP)." });

    const id = String(req.params?.id || "").trim();
    const a = await prisma.announcement.findUnique({
      where: { id },
      select: { id: true, title: true, body: true, kind: true, publishAt: true },
    });
    if (!a) return res.status(404).json({ ok: false, error: "Announcement not found." });

    const users = await prisma.user.findMany({ select: { email: true, name: true }, take: 500 });
    const subject = `Academy update: ${a.title}`;
    let sent = 0;
    let failed = 0;
    for (const u of users) {
      try {
        const html = `
          <div style="font-family: Arial, sans-serif; line-height:1.6; color:#0f172a;">
            <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden;">
              <div style="padding:18px 22px; background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 60%, #7c3aed 100%); color:#fff;">
                <div style="font-size:14px; opacity:0.95; font-weight:800;">Bharat Skill Development Academy</div>
                <div style="font-size:20px; font-weight:900; margin-top:2px;">${a.title}</div>
              </div>
              <div style="padding:22px;">
                <p style="margin:0 0 12px;">Hi <strong>${String(u.name || u.email)}</strong>,</p>
                <div style="white-space:pre-wrap; margin:0; color:#0f172a;">${a.body}</div>
                <p style="margin: 16px 0 0; color:#475569; font-size: 13px;">
                  Need help? Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.
                </p>
              </div>
            </div>
          </div>
        `;
        const r = await deliverEmail({ to: u.email, subject, html });
        if (r.sent) sent += 1;
        else failed += 1;
      } catch {
        failed += 1;
      }
    }
    return res.json({ ok: true, sent, failed });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

// ---------------- Recommendations: People also bought ----------------
app.post("/recommendations/also-bought", (req, res) => {
  (async () => {
    const keys = Array.isArray(req.body?.courseKeys) ? req.body.courseKeys : [];
    const courseKeys = keys.map((k) => String(k || "").trim().toLowerCase()).filter(Boolean);
    if (courseKeys.length === 0) return res.json({ ok: true, recs: {} });

    const orders = await prisma.order.findMany({
      where: { paymentStatus: ORDER_PAYMENT_PAID },
      orderBy: { createdAt: "desc" },
      take: 800,
      select: { items: true },
    });

    const countsBySeed = new Map(); // seed -> Map(courseKey -> count)
    for (const seed of courseKeys) countsBySeed.set(seed, new Map());

    for (const o of orders) {
      const arr = Array.isArray(o.items) ? o.items : [];
      const courseList = arr
        .map((it) => {
          const c = it?.course || it || {};
          return String(c?.slug || slugify(c?.name || it?.name || "")).trim().toLowerCase();
        })
        .filter(Boolean);
      if (courseList.length < 2) continue;
      const set = new Set(courseList);
      for (const seed of courseKeys) {
        if (!set.has(seed)) continue;
        const counter = countsBySeed.get(seed);
        for (const other of set) {
          if (other === seed) continue;
          counter.set(other, (counter.get(other) || 0) + 1);
        }
      }
    }

    const recs = {};
    for (const [seed, map] of countsBySeed.entries()) {
      const top = Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([courseKey, score]) => ({ courseKey, score }));
      recs[seed] = top;
    }
    return res.json({ ok: true, recs });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

// ---------------- WhatsApp lead capture: Request callback ----------------
app.post("/leads/callback", (req, res) => {
  (async () => {
    const maybeUser = await requireAuth(req, res).catch(() => null);
    const name = String(req.body?.name || "").trim();
    const mobile = String(req.body?.mobile || "").trim();
    const courseKey = req.body?.courseKey ? String(req.body.courseKey).trim().toLowerCase() : null;
    const rawMessage = req.body?.message != null ? String(req.body.message).trim() : "";
    const courseLabel = String(req.body?.courseLabel || "").trim();
    const company = String(req.body?.company || "").trim();
    const leadEmail = String(req.body?.leadEmail || "").trim();
    const notes = String(req.body?.notes || "").trim();
    if (!name || name.length < 2) return res.status(400).json({ ok: false, error: "name is required." });
    if (!mobile || mobile.length < 8) return res.status(400).json({ ok: false, error: "mobile is required." });

    const message = buildCallbackStoredMessage({
      mobile,
      rawMessage,
      courseLabel,
      company,
      leadEmail,
      notes,
    });

    const hasDemoFields = Boolean(courseLabel || company || leadEmail || notes);
    const extraMessageForMail = hasDemoFields ? "" : rawMessage;

    const lead = await prisma.callbackRequest.create({
      data: {
        userId: maybeUser?.id || null,
        name,
        mobile,
        courseKey,
        message,
        status: "new",
      },
      select: { id: true, status: true, createdAt: true },
    });

    // Best-effort: email support (field-by-field layout matches the forms)
    let emailSent = false;
    try {
      if (!mailConfigured()) {
        console.warn(
          `[LEADS] Lead saved id=${lead.id} — no email (set RESEND_API_KEY on Render Free, or SMTP on paid).`
        );
      } else {
        const supportTo = String(process.env.SUPPORT_EMAIL || mailFrom || smtpUser || "support@example.com")
          .trim()
          .replace(/^["']|["']$/g, "");
        const kind = hasDemoFields ? "Course demo" : "Callback";
        const subject = `${kind}: ${name} (${maskMobile(mobile)})`;
        let html = buildLeadNotificationHtml({
          name,
          mobile,
          courseKey,
          courseLabel,
          company,
          leadEmail,
          notes,
          extraMessage: extraMessageForMail,
        });
        html += `<p style="margin:16px 0 0;font-size:14px;color:#64748b;"><strong>Account on site:</strong> ${escapeHtml(
          maybeUser?.email || "Guest (not logged in)"
        )}</p>`;
        const r = await deliverEmail({ to: supportTo, subject, html });
        emailSent = Boolean(r.sent);
        if (r.sent) console.log(`[LEADS] Notification email sent for lead id=${lead.id} to=${supportTo}`);
        else console.error(`[LEADS] Lead saved id=${lead.id} email failed:`, r.reason || "unknown");
      }
    } catch (err) {
      console.error(`[LEADS] Lead saved id=${lead.id} but email failed:`, err?.message || err);
    }

    return res.json({ ok: true, lead, emailSent });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.get("/admin/leads/callbacks", (req, res) => {
  (async () => {
    const user = await requireAdmin(req, res);
    if (!user) return;
    const rows = await prisma.callbackRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, name: true, mobile: true, courseKey: true, message: true, status: true, createdAt: true, userId: true },
    });
    return res.json({ ok: true, leads: rows });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.post("/admin/leads/callbacks/:id/status", (req, res) => {
  (async () => {
    const user = await requireAdmin(req, res);
    if (!user) return;
    const id = String(req.params?.id || "").trim();
    const status = String(req.body?.status || "").trim().toLowerCase();
    if (!id) return res.status(400).json({ ok: false, error: "id is required." });
    if (!["new", "contacted", "closed"].includes(status)) {
      return res.status(400).json({ ok: false, error: "Invalid status." });
    }
    const updated = await prisma.callbackRequest.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });
    return res.json({ ok: true, lead: updated });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.get("/admin/orders", (req, res) => {
  (async () => {
    const user = await requireAdmin(req, res);
    if (!user) return;

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        orderId: true,
        paymentMethod: true,
        paymentStatus: true,
        amountPaid: true,
        discountPct: true,
        createdAt: true,
        userId: true,
        items: true,
        verifiedAt: true,
        verifiedByEmail: true,
        paymentReference: true,
        user: { select: { email: true, name: true } },
      },
    });

    return res.json({ ok: true, orders });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.post("/admin/orders/:orderId/verify-payment", (req, res) => {
  (async () => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const orderIdParam = String(req.params?.orderId || "").trim();
    if (!orderIdParam) {
      return res.status(400).json({ ok: false, error: "orderId is required." });
    }

    const paymentReference = String(req.body?.paymentReference || "").trim();
    const matchedInStatement = Boolean(req.body?.matchedInStatement);
    if (!matchedInStatement) {
      return res.status(400).json({
        ok: false,
        error: "You must confirm that you matched this payment in your bank/UPI statement.",
      });
    }
    if (paymentReference.length < 6) {
      return res.status(400).json({
        ok: false,
        error: "Enter the UPI/bank reference (or note) you matched — at least 6 characters.",
      });
    }

    const order = await prisma.order.findUnique({
      where: { orderId: orderIdParam },
      include: { user: true },
    });
    if (!order) {
      return res.status(404).json({ ok: false, error: "Order not found." });
    }
    if (!order.user) {
      return res.status(500).json({ ok: false, error: "Order has no linked user." });
    }

    if (isPaidOrderStatus(order.paymentStatus)) {
      return res.json({
        ok: true,
        alreadyVerified: true,
        orderId: order.orderId,
        email: "skipped",
      });
    }

    const updated = await prisma.order.update({
      where: { orderId: orderIdParam },
      data: {
        paymentStatus: ORDER_PAYMENT_PAID,
        verifiedAt: new Date(),
        verifiedByEmail: String(admin.email || "").trim() || null,
        paymentReference,
      },
      include: { user: true },
    });

    const emailResult = await sendEnrollmentEmailForOrder(updated.user, updated, {
      manualStaffVerification: true,
    });
    if (emailResult.sent) {
      console.log(`[ORDER] Verified + enrollment email sent order=${updated.orderId} to=${updated.user.email}`);
    } else {
      console.warn(
        `[ORDER] Verified but email failed order=${updated.orderId} reason=${emailResult.reason || "unknown"}`
      );
    }

    return res.json({
      ok: true,
      orderId: updated.orderId,
      email: emailResult.sent ? "sent" : "not_sent",
      emailReason: emailResult.sent ? null : emailResult.reason,
      emailedTo: updated.user.email,
    });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

// Admin: explicitly mark an order as NOT paid (keep pending, clear audit fields).
app.post("/admin/orders/:orderId/mark-not-paid", (req, res) => {
  (async () => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const orderIdParam = String(req.params?.orderId || "").trim();
    if (!orderIdParam) {
      return res.status(400).json({ ok: false, error: "orderId is required." });
    }

    const order = await prisma.order.findUnique({
      where: { orderId: orderIdParam },
      include: { user: true },
    });
    if (!order) {
      return res.status(404).json({ ok: false, error: "Order not found." });
    }

    // If it's already paid, require the admin to manually handle refunds/out-of-band.
    if (isPaidOrderStatus(order.paymentStatus)) {
      return res.status(409).json({
        ok: false,
        error: "This order is already marked paid. Use a refund/correction flow instead of marking not paid.",
      });
    }

    const updated = await prisma.order.update({
      where: { orderId: orderIdParam },
      data: {
        paymentStatus: ORDER_PAYMENT_NOT_PAID,
        verifiedAt: null,
        verifiedByEmail: null,
        paymentReference: null,
      },
      select: { orderId: true, paymentStatus: true },
    });

    console.log(`[ORDER] Marked not paid order=${updated.orderId} by=${String(admin.email || "").trim()}`);

    return res.json({ ok: true, orderId: updated.orderId, paymentStatus: updated.paymentStatus });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.post("/issues/report", (req, res) => {
  (async () => {
    const user = await requireAuth(req, res);
    if (!user) return;

    const body = req.body || {};
    const courseKey = String(body.courseKey || "").trim().toLowerCase();
    const courseName = String(body.courseName || "").trim();
    const orderId = body.orderId ? String(body.orderId).trim() : null;
    const message = String(body.message || "").trim();

    if (!courseKey || !courseName) {
      return res.status(400).json({ ok: false, error: "courseKey and courseName are required." });
    }
    if (!message || message.length < 3) {
      return res.status(400).json({ ok: false, error: "message is required." });
    }

    const issue = await prisma.issueReport.create({
      data: {
        userId: user.id,
        courseKey,
        courseName,
        orderId,
        message,
        status: "open",
      },
    });

    // Best-effort: email support
    try {
      if (mailConfigured()) {
        const supportTo = String(process.env.SUPPORT_EMAIL || mailFrom || smtpUser || "support@example.com");
        const subject = `Course issue report – ${courseName} (${courseKey})`;
        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color:#0f172a;">
            <h3 style="margin:0 0 10px;">Support request</h3>
            <p><strong>Course:</strong> ${courseName}</p>
            <p><strong>Course key:</strong> ${courseKey}</p>
            <p><strong>Order ID:</strong> ${orderId || "N/A"}</p>
            <p><strong>User:</strong> ${String(user.email || "")}</p>
            <hr/>
            <p style="white-space:pre-wrap; margin:0;">${message}</p>
          </div>
        `;
        await deliverEmail({ to: supportTo, subject, html });
      }
    } catch {
      // ignore email failure
    }

    return res.json({ ok: true, issueId: issue.id });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.get("/admin/issues", (req, res) => {
  (async () => {
    const user = await requireAdmin(req, res);
    if (!user) return;

    const issues = await prisma.issueReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, courseKey: true, courseName: true, orderId: true, message: true, status: true, createdAt: true, userId: true },
    });

    return res.json({ ok: true, issues });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

app.post("/admin/issues/:id/reply", (req, res) => {
  (async () => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const id = String(req.params?.id || "").trim();
    const reply = String(req.body?.reply || "").trim();
    const status = String(req.body?.status || "resolved").trim();
    if (!id) return res.status(400).json({ ok: false, error: "id is required." });
    if (!reply || reply.length < 2) return res.status(400).json({ ok: false, error: "reply is required." });

    const issue = await prisma.issueReport.findUnique({ where: { id } });
    if (!issue) return res.status(404).json({ ok: false, error: "Issue not found." });

    const updated = await prisma.issueReport.update({
      where: { id },
      data: {
        reply,
        status,
        repliedAt: new Date(),
      },
    });

    // Email user (best-effort)
    try {
      const user = await prisma.user.findUnique({ where: { id: issue.userId } });
      if (user && mailConfigured()) {
        const supportAddr = String(process.env.SUPPORT_EMAIL || mailFrom || smtpUser || "support@example.com");
        const subject = `Support reply – ${issue.courseName}`;
        const html = `
          <div style="font-family: Arial, sans-serif; line-height:1.6; color:#0f172a;">
            <h2 style="margin:0 0 10px;">Bharat Skill Development Academy – Support</h2>
            <p>Hi <strong>${String(user.name || user.email)}</strong>,</p>
            <p>We reviewed your request for:</p>
            <p style="font-weight:900;">${issue.courseName}</p>
            <hr/>
            <p style="white-space:pre-wrap; margin:0;">${reply}</p>
            <p style="margin:16px 0 0; color:#475569; font-size:13px;">
              If you need more help, reply to this email or contact <a href="mailto:${supportAddr}">${supportAddr}</a>.
            </p>
          </div>
        `;
        await deliverEmail({ to: user.email, subject, html });
      }
    } catch {
      // ignore email failures
    }

    return res.json({ ok: true, issue: updated });
  })().catch((err) => res.status(500).json({ ok: false, error: err?.message || "Failed." }));
});

// Serve React (Vite build) — MUST be registered after all API routes so /auth/*, /cart, etc. still work.
// Render: cwd is usually repo root → client/dist. If not, fall back to path next to server/server.js.
const clientDistPathCwd = path.resolve(process.cwd(), "client/dist");
const clientDistPathFile = path.resolve(__dirname, "../client/dist");
const clientDistPath = fs.existsSync(path.join(clientDistPathCwd, "index.html"))
  ? clientDistPathCwd
  : clientDistPathFile;
const assetsPath = path.join(clientDistPath, "assets");
const indexPath = path.join(clientDistPath, "index.html");

console.log("cwd:", process.cwd());
console.log("clientDistPath:", clientDistPath);
console.log("assetsPath:", assetsPath);
console.log("indexPath:", indexPath);
console.log("assets exists:", fs.existsSync(assetsPath));
console.log("index exists:", fs.existsSync(indexPath));

// Default fallthrough (true): missing files call next() without throwing — avoids spurious 500s.
// `fallthrough: false` forwards lookup failures as errors → often becomes HTTP 500 for /assets/*.js.
app.use("/assets", express.static(assetsPath));
app.use(express.static(clientDistPath));

// SPA fallback only for non-file, non-api routes
app.get("*", (req, res, next) => {
  if (
    req.path.startsWith("/api") ||
    req.path.startsWith("/health") ||
    req.path.startsWith("/assets") ||
    path.extname(req.path)
  ) {
    return next();
  }
  res.sendFile(indexPath, (err) => {
    if (err) next(err);
  });
});

// 404 for unknown file/api routes
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
