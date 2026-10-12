import nodemailer from "nodemailer";
import { EVENT, TICKETS, formatPrice } from "@/lib/event";
import { createVerificationToken } from "@/lib/verify";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function makeRef() {
  const d = new Date();
  const stamp = `${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `DN26-${stamp}-${rand}`;
}

const senderEmail = () => (process.env.SMTP_USER || process.env.EMAIL_USER || "").trim();

function getOrganiserRecipients() {
  const recipients = new Set();
  recipients.add("rahuldhaundiyal22@gmail.com");

  if (process.env.ORGANISER_EMAIL) {
    process.env.ORGANISER_EMAIL.split(/[,;]+/).forEach((addr) => {
      const clean = addr.trim();
      if (clean) recipients.add(clean);
    });
  }

  const sender = senderEmail();
  if (sender) recipients.add(sender);

  return Array.from(recipients).join(", ");
}

function getTransport() {
  const { SMTP_HOST, SMTP_PORT } = process.env;
  const SMTP_USER = senderEmail();
  const SMTP_PASS = (process.env.SMTP_PASS || process.env.EMAIL_PASS || "").replace(/\s+/g, "");
  if (!SMTP_USER || !SMTP_PASS) throw new Error("Email is not configured on the server (EMAIL_USER / EMAIL_PASS missing).");
  const port = Number(SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function getBaseUrl(req) {
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const host = req.headers.get("host");
  if (host) {
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return "https://dandiya-night-git-main-ravindrauiets-projects.vercel.app";
}

function organiserEmailHtml(b, { approveUrl, rejectUrl, waCustomerUrl }) {
  const row = (k, v) =>
    `<tr><td style="padding:6px 12px;color:#7a5a4a">${k}</td><td style="padding:6px 12px;font-weight:600">${esc(v)}</td></tr>`;

  return `
  <div style="font-family:Arial,sans-serif;max-width:540px;margin:auto;background:#fff8ef;border:1px solid #f1d3a3;border-radius:14px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#ff7a1a,#ff3d8b);color:#fff;padding:22px;text-align:center">
      <div style="font-size:12px;letter-spacing:2px;font-weight:bold;background:rgba(0,0,0,0.2);display:inline-block;padding:3px 12px;border-radius:999px">NEW BOOKING FOR VERIFICATION</div>
      <div style="font-size:24px;font-weight:bold;margin-top:6px">${EVENT.name}</div>
      <div style="font-size:14px;margin-top:4px">${EVENT.date} · ${EVENT.time}<br>${EVENT.venue}</div>
    </div>
    <div style="padding:22px;text-align:center">
      <div style="background:#fff3cd;border:1px solid #ffeeba;border-radius:8px;padding:12px;color:#856404;font-size:13px;text-align:left;margin-bottom:16px">
        ⚠️ <b>Payment Verification Needed:</b><br>
        Customer payment screenshot is attached. Verify the amount in your bank/UPI before approving.
      </div>

      <table style="margin:16px auto;border-collapse:collapse;text-align:left;font-size:14px;width:100%;background:#fff;border-radius:8px;padding:8px">
        ${row("Booking Ref", b.ref)}
        ${row("Attendee Name", b.name)}
        ${row("Mobile Number", b.mobile)}
        ${row("Email Address", b.email)}
        ${row("Ticket Type", b.ticketName)}
        ${row("Quantity", b.qty)}
        ${row("Total Amount", formatPrice(b.total))}
        ${row("Submitted At", b.createdAt)}
      </table>

      <div style="margin:22px 0 10px;text-align:center">
        <a href="${approveUrl}" style="background:#27ae60;color:#ffffff;padding:12px 22px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;margin:6px;font-size:14px">
          ✅ Approve &amp; Send Gate QR Ticket
        </a>
        <br>
        <a href="${rejectUrl}" style="background:#c0392b;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;margin:6px;font-size:13px">
          ❌ Reject (Invalid Screenshot)
        </a>
        <br>
        <a href="${waCustomerUrl}" target="_blank" style="background:#25d366;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;margin:6px;font-size:13px">
          💬 Message Customer on WhatsApp
        </a>
      </div>
    </div>
  </div>`;
}

function customerPendingEmailHtml(b) {
  const row = (k, v) =>
    `<tr><td style="padding:6px 12px;color:#7a5a4a">${k}</td><td style="padding:6px 12px;font-weight:600">${esc(v)}</td></tr>`;

  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#fff8ef;border:1px solid #f1d3a3;border-radius:14px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#ff7a1a,#ff3d8b);color:#fff;padding:20px;text-align:center">
      <div style="font-size:12px;letter-spacing:2px;font-weight:bold">BOOKING REQUEST RECEIVED</div>
      <div style="font-size:24px;font-weight:bold;margin-top:4px">${EVENT.name}</div>
      <div style="font-size:14px;margin-top:4px">${EVENT.date} · ${EVENT.time}<br>${EVENT.venue}</div>
    </div>
    <div style="padding:22px;text-align:center">
      <div style="background:#eaf2f8;border:1px solid #aed6f1;border-radius:8px;padding:14px;text-align:left;color:#1b4f72;font-size:13px;line-height:1.5">
        ⏳ <b>Status: Under Payment Verification</b><br>
        We have received your booking details and payment screenshot. Our team is verifying the transaction. 
        Once verified, your official Entry Pass with QR code will be issued and emailed to you.
      </div>

      <table style="margin:16px auto;border-collapse:collapse;text-align:left;font-size:14px;width:100%;background:#fff;border-radius:8px;padding:8px">
        ${row("Booking Ref", b.ref)}
        ${row("Name", b.name)}
        ${row("Mobile", b.mobile)}
        ${row("Email", b.email)}
        ${row("Ticket", b.ticketName)}
        ${row("Quantity", b.qty)}
        ${row("Total Amount", formatPrice(b.total))}
      </table>

      <div style="background:#fff3cd;border:1px solid #ffeeba;border-radius:8px;padding:12px;margin-top:16px;font-size:13px;color:#856404;text-align:left">
        💡 <b>Want instant verification?</b><br>
        Send your booking reference (<b>${esc(b.ref)}</b>) and payment screenshot directly to organiser Rahul Dhaundiyal on WhatsApp:
        <br><br>
        <a href="https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent(`Hi Rahul, I have submitted booking request ${b.ref} for Dandiya Night. Here is my payment proof for quick verification.`)}" target="_blank" style="background:#25d366;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">
          📲 Fast-Track via WhatsApp
        </a>
      </div>

      <p style="font-size:12px;color:#888;margin-top:18px">
        Have questions? Contact +91 ${EVENT.phones[0]} or +91 ${EVENT.phones[1]}.
      </p>
    </div>
  </div>`;
}

export async function POST(req) {
  try {
    const form = await req.formData();
    const name = String(form.get("name") || "").trim().slice(0, 80);
    const mobile = String(form.get("mobile") || "").trim();
    const email = String(form.get("email") || "").trim();
    const ticketId = String(form.get("ticket") || "");
    const qty = Math.floor(Number(form.get("qty")));
    const file = form.get("screenshot");

    const ticket = TICKETS.find((t) => t.id === ticketId);
    if (!name) return Response.json({ error: "Please enter your full name." }, { status: 400 });
    if (!/^[6-9]\d{9}$/.test(mobile)) return Response.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (!ticket) return Response.json({ error: "Please choose a ticket type." }, { status: 400 });
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return Response.json({ error: "Number of passes must be 1–20." }, { status: 400 });

    const hasFile = file && typeof file === "object" && file.size > 0;
    if (ticket.price > 0 && !hasFile) return Response.json({ error: "Please attach your payment screenshot." }, { status: 400 });
    if (hasFile && !file.type.startsWith("image/")) return Response.json({ error: "Screenshot must be an image." }, { status: 400 });
    if (hasFile && file.size > MAX_BYTES) return Response.json({ error: "Screenshot must be under 4 MB." }, { status: 400 });

    const booking = {
      ref: makeRef(),
      name,
      mobile,
      email,
      ticketName: ticket.name,
      qty,
      total: ticket.price * qty,
      createdAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    };

    // Generate secure admin verification token
    const token = createVerificationToken(booking);
    const baseUrl = getBaseUrl(req);
    const approveUrl = `${baseUrl}/api/admin/verify?token=${encodeURIComponent(token)}&action=approve`;
    const rejectUrl = `${baseUrl}/api/admin/verify?token=${encodeURIComponent(token)}&action=reject`;
    const waCustomerUrl = `https://wa.me/91${mobile}?text=${encodeURIComponent(
      `Hi ${name}! Regarding your Dandiya Night booking ${booking.ref}: we received your payment screenshot.`
    )}`;

    const transport = getTransport();
    const from = `"${EVENT.name}" <${senderEmail()}>`;

    // 1) Email to Organisers with attached screenshot & 1-click Approval buttons
    const organiserAttachments = [];
    if (hasFile) {
      organiserAttachments.push({
        filename: `payment-${booking.ref}.${(file.type.split("/")[1] || "png").replace("jpeg", "jpg")}`,
        content: Buffer.from(await file.arrayBuffer()),
        contentType: file.type,
      });
    }

    await transport.sendMail({
      from,
      to: getOrganiserRecipients(),
      replyTo: email,
      subject: `🚨 [Verification Required] ${booking.ref} – ${name} – ${ticket.name} x${qty} (₹${booking.total})`,
      html: organiserEmailHtml(booking, { approveUrl, rejectUrl, waCustomerUrl }),
      attachments: organiserAttachments,
    });

    // 2) Acknowledgment Email to Customer (NO ticket QR attached yet until verified!)
    await transport.sendMail({
      from,
      to: email,
      subject: `Booking Request Received (Pending Verification) – ${booking.ref} – ${EVENT.name}`,
      html: customerPendingEmailHtml(booking),
    });

    // Return pending status to frontend (no QR code returned until admin verification)
    return Response.json({ ok: true, booking, pending: true });
  } catch (err) {
    console.error("Booking submission error:", err);
    return Response.json({ error: "Could not submit your booking right now. Please try again or WhatsApp the organiser." }, { status: 500 });
  }
}
