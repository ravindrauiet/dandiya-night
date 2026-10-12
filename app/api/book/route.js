import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { EVENT, TICKETS, formatPrice } from "@/lib/event";

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

// Accepts either EMAIL_USER/EMAIL_PASS or SMTP_USER/SMTP_PASS
const senderEmail = () => (process.env.SMTP_USER || process.env.EMAIL_USER || "").trim();

function getOrganiserRecipients() {
  const recipients = new Set();

  // Event manager requested by user
  recipients.add("rahuldhaundiyal22@gmail.com");

  // Additional organiser emails from environment variable if configured
  if (process.env.ORGANISER_EMAIL) {
    process.env.ORGANISER_EMAIL.split(/[,;]+/).forEach((addr) => {
      const clean = addr.trim();
      if (clean) recipients.add(clean);
    });
  }

  // Sender email account so admin gets a copy as well
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

function emailHtml(b, { forOrganiser }) {
  const row = (k, v) =>
    `<tr><td style="padding:6px 12px;color:#7a5a4a">${k}</td><td style="padding:6px 12px;font-weight:600">${esc(v)}</td></tr>`;
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#fff8ef;border:1px solid #f1d3a3;border-radius:14px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#ff7a1a,#ff3d8b);color:#fff;padding:20px;text-align:center">
      <div style="font-size:12px;letter-spacing:2px">${forOrganiser ? "NEW BOOKING REQUEST" : "YOUR BOOKING REQUEST"}</div>
      <div style="font-size:24px;font-weight:bold;margin-top:4px">${EVENT.name}</div>
      <div style="font-size:14px;margin-top:4px">${EVENT.date} · ${EVENT.time}<br>${EVENT.venue}</div>
    </div>
    <div style="padding:20px;text-align:center">
      <img src="cid:bookingqr" alt="Booking QR" width="220" height="220" style="display:block;margin:0 auto 10px">
      <div style="font-size:13px;color:#7a5a4a">Show this QR at the entry gate</div>
      <table style="margin:16px auto;border-collapse:collapse;text-align:left;font-size:14px">
        ${row("Reference", b.ref)}
        ${row("Name", b.name)}
        ${row("Mobile", b.mobile)}
        ${row("Email", b.email)}
        ${row("Ticket", b.ticketName)}
        ${row("Quantity", b.qty)}
        ${row("Total", formatPrice(b.total))}
        ${row("Submitted", b.createdAt)}
      </table>
      ${
        forOrganiser
          ? `<p style="font-size:13px;color:#7a5a4a">Payment screenshot is attached. Verify it, then confirm the booking with the customer.</p>`
          : `<p style="font-size:13px;color:#7a5a4a">Status: <b>Pending payment verification.</b> Your entry is valid once the organiser verifies your payment.<br>Questions? WhatsApp ${EVENT.phones[0]}.</p>`
      }
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

    // What the QR code contains – readable by any phone camera at the gate
    const qrText = [
      EVENT.name,
      `Ref: ${booking.ref}`,
      `Name: ${booking.name}`,
      `Mobile: ${booking.mobile}`,
      `Ticket: ${booking.ticketName} x ${booking.qty}`,
      `Total: ${formatPrice(booking.total)}`,
    ].join("\n");

    const qrPng = await QRCode.toBuffer(qrText, { width: 440, margin: 2, errorCorrectionLevel: "M" });
    const qrDataUrl = `data:image/png;base64,${qrPng.toString("base64")}`;

    const transport = getTransport();
    const from = `"${EVENT.name}" <${senderEmail()}>`;
    const qrAttachment = { filename: `${booking.ref}.png`, content: qrPng, cid: "bookingqr" };

    // 1) Email to the organiser – all details + QR + payment screenshot
    const organiserAttachments = [qrAttachment];
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
      subject: `New booking ${booking.ref} – ${name} – ${ticket.name} x${qty}`,
      html: emailHtml(booking, { forOrganiser: true }),
      attachments: organiserAttachments,
    });

    // 2) Email to the customer – their details + QR code
    await transport.sendMail({
      from,
      to: email,
      subject: `Your ${EVENT.name} booking – ${booking.ref}`,
      html: emailHtml(booking, { forOrganiser: false }),
      attachments: [qrAttachment],
    });

    return Response.json({ ok: true, booking, qr: qrDataUrl });
  } catch (err) {
    console.error("Booking error:", err);
    return Response.json({ error: "Could not submit your booking right now. Please try again or WhatsApp the organiser." }, { status: 500 });
  }
}
