import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { EVENT, formatPrice } from "@/lib/event";
import { verifyToken } from "@/lib/verify";

export const runtime = "nodejs";

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const senderEmail = () => (process.env.SMTP_USER || process.env.EMAIL_USER || "").trim();

function getTransport() {
  const { SMTP_HOST, SMTP_PORT } = process.env;
  const SMTP_USER = senderEmail();
  const SMTP_PASS = (process.env.SMTP_PASS || process.env.EMAIL_PASS || "").replace(/\s+/g, "");
  if (!SMTP_USER || !SMTP_PASS) throw new Error("Email credentials missing on server.");
  const port = Number(SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function customerConfirmedEmailHtml(b) {
  const row = (k, v) =>
    `<tr><td style="padding:6px 12px;color:#7a5a4a">${k}</td><td style="padding:6px 12px;font-weight:600">${esc(v)}</td></tr>`;

  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#fff8ef;border:1px solid #f1d3a3;border-radius:14px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#ff7a1a,#ff3d8b);color:#fff;padding:24px;text-align:center">
      <div style="font-size:12px;letter-spacing:2px;font-weight:bold;background:rgba(0,0,0,0.2);display:inline-block;padding:4px 12px;border-radius:999px">✅ PAYMENT VERIFIED & CONFIRMED</div>
      <div style="font-size:26px;font-weight:bold;margin-top:8px">${EVENT.name}</div>
      <div style="font-size:14px;margin-top:4px">${EVENT.date} · ${EVENT.time}<br>${EVENT.venue}</div>
    </div>
    <div style="padding:24px;text-align:center">
      <div style="font-size:16px;font-weight:bold;color:#2c0c1e;margin-bottom:6px">Your Official Entry Pass</div>
      <div style="font-size:13px;color:#7a5a4a;margin-bottom:14px">Show this digital QR code on your mobile at the entry gate</div>
      
      <img src="cid:bookingqr" alt="Official Gate QR Pass" width="230" height="230" style="display:block;margin:0 auto 12px;border:2px solid #ff7a1a;border-radius:12px;background:#fff;padding:6px">
      
      <table style="margin:16px auto;border-collapse:collapse;text-align:left;font-size:14px;width:100%;max-width:380px;background:#fff;border-radius:8px;padding:8px">
        ${row("Booking Ref", b.ref)}
        ${row("Attendee Name", b.name)}
        ${row("Mobile Number", b.mobile)}
        ${row("Pass Type", b.ticketName)}
        ${row("Pass Quantity", `${b.qty} Pass${b.qty > 1 ? "es" : ""}`)}
        ${row("Total Paid", formatPrice(b.total))}
        ${row("Status", "Verified & Confirmed")}
      </table>

      <div style="background:#eafaf1;border:1px solid #27ae60;border-radius:8px;padding:12px;margin-top:16px;font-size:13px;color:#1e824c;text-align:left">
        ✓ <b>Entry Guidelines:</b><br>
        • Please arrive at Opulent Mall by 6:00 PM.<br>
        • Traditional festive attire is highly recommended.<br>
        • Bring this email or save this QR code to your phone gallery.
      </div>

      <p style="font-size:12px;color:#888;margin-top:18px">
        Need assistance? WhatsApp organiser Rahul Dhaundiyal at +91 ${EVENT.phones[0]}.
      </p>
    </div>
  </div>`;
}

function customerRejectedEmailHtml(b) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#fff8ef;border:1px solid #f1d3a3;border-radius:14px;overflow:hidden">
    <div style="background:#c0392b;color:#fff;padding:20px;text-align:center">
      <div style="font-size:12px;letter-spacing:2px;font-weight:bold">PAYMENT VERIFICATION UPDATE</div>
      <div style="font-size:22px;font-weight:bold;margin-top:6px">${EVENT.name}</div>
    </div>
    <div style="padding:22px;text-align:left;font-size:14px;color:#333;line-height:1.6">
      <p>Hello <b>${esc(b.name)}</b>,</p>
      <p>
        We reviewed the payment proof attached to your booking request (<b>${esc(b.ref)}</b>), but our organizers were unable to verify the transaction in our bank/UPI records.
      </p>
      <div style="background:#fde8e8;border:1px solid #e74c3c;border-radius:8px;padding:14px;margin:16px 0;font-size:13px">
        <b>What to do next:</b><br>
        Please reply to this email with your valid UPI transaction screenshot (showing UTR / Transaction ID), or send it directly on WhatsApp to <b>+91 ${EVENT.phones[0]}</b>.
      </div>
      <p>
        Once valid payment is confirmed, we will immediately generate and send your official Entry QR Ticket.
      </p>
    </div>
  </div>`;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const action = searchParams.get("action"); // "approve" or "reject"

  const booking = verifyToken(token);

  if (!booking) {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Invalid Link</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family:sans-serif;padding:40px;text-align:center;background:#1a0712;color:#fff">
          <h2 style="color:#ff6b6b">⚠️ Invalid or Expired Verification Link</h2>
          <p style="color:#ccc">This link is either corrupted or has expired. Please check the email notification.</p>
        </body>
      </html>`,
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  const transport = getTransport();
  const from = `"${EVENT.name}" <${senderEmail()}>`;

  if (action === "approve") {
    // 1) Generate the official Gate Entry QR code
    const qrText = [
      EVENT.name,
      `Ref: ${booking.ref}`,
      `Name: ${booking.name}`,
      `Mobile: ${booking.mobile}`,
      `Ticket: ${booking.ticketName} x ${booking.qty}`,
      `Total: ${formatPrice(booking.total)}`,
      `Verified: YES`,
    ].join("\n");

    const qrPng = await QRCode.toBuffer(qrText, { width: 440, margin: 2, errorCorrectionLevel: "M" });
    const qrAttachment = { filename: `${booking.ref}-ticket.png`, content: qrPng, cid: "bookingqr" };

    // 2) Send confirmed pass to customer
    await transport.sendMail({
      from,
      to: booking.email,
      subject: `🎉 Entry Pass Confirmed! ${EVENT.name} – ${booking.ref}`,
      html: customerConfirmedEmailHtml(booking),
      attachments: [qrAttachment],
    });

    const waCustomerMsg = `Hi ${booking.name}! Your Dandiya Night 2026 booking (${booking.ref}) is APPROVED. Your entry pass for ${booking.ticketName} (x${booking.qty}) has been emailed to ${booking.email}. See you on Saturday 17 October at Opulent Mall, Ghaziabad!`;
    const waLink = `https://wa.me/91${booking.mobile}?text=${encodeURIComponent(waCustomerMsg)}`;

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Booking Approved</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; background: #100416; color: #fff; padding: 30px 16px; margin: 0; line-height: 1.5; }
            .card { max-width: 520px; margin: 0 auto; background: rgba(255,255,255,0.06); border: 1px solid #ffc94a; border-radius: 18px; padding: 28px; text-align: center; }
            .badge { display: inline-block; background: #2ec4b6; color: #100416; font-weight: 700; padding: 4px 14px; border-radius: 999px; font-size: 0.8rem; }
            h1 { color: #ffc94a; margin: 12px 0 6px; font-size: 1.6rem; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; text-align: left; font-size: 0.95rem; }
            td { padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .btn { display: inline-block; padding: 12px 24px; border-radius: 999px; font-weight: 600; text-decoration: none; margin: 8px 4px; }
            .btn-wa { background: #25d366; color: #0b2214; }
            .btn-home { background: transparent; border: 1px solid #ffc94a; color: #ffc94a; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">✓ APPROVAL SUCCESSFUL</span>
            <h1>Official Ticket Issued</h1>
            <p style="color:#e4c7b6">The gate QR pass has been emailed to <b>${esc(booking.email)}</b>.</p>
            
            <table>
              <tr><td>Reference</td><td><b>${esc(booking.ref)}</b></td></tr>
              <tr><td>Attendee</td><td><b>${esc(booking.name)}</b></td></tr>
              <tr><td>Mobile</td><td><b>${esc(booking.mobile)}</b></td></tr>
              <tr><td>Ticket</td><td>${esc(booking.ticketName)} x ${booking.qty}</td></tr>
              <tr><td>Total</td><td><b>${formatPrice(booking.total)}</b></td></tr>
            </table>

            <div style="margin-top: 24px">
              <a href="${waLink}" target="_blank" class="btn btn-wa">💬 Send Ticket Notification on WhatsApp</a>
              <br><br>
              <a href="/" class="btn btn-home">Return to Website</a>
            </div>
          </div>
        </body>
      </html>`,
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } else if (action === "reject") {
    // Send rejection email to customer requesting valid proof
    await transport.sendMail({
      from,
      to: booking.email,
      subject: `⚠️ Action Required: ${EVENT.name} Booking Request – ${booking.ref}`,
      html: customerRejectedEmailHtml(booking),
    });

    const waCustomerMsg = `Hi ${booking.name}, regarding your Dandiya Night booking ${booking.ref}: we could not verify your payment screenshot. Please share your UPI transaction receipt so we can issue your entry ticket.`;
    const waLink = `https://wa.me/91${booking.mobile}?text=${encodeURIComponent(waCustomerMsg)}`;

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Booking Rejected</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; background: #100416; color: #fff; padding: 30px 16px; margin: 0; line-height: 1.5; }
            .card { max-width: 520px; margin: 0 auto; background: rgba(255,255,255,0.06); border: 1px solid #ff5252; border-radius: 18px; padding: 28px; text-align: center; }
            .badge { display: inline-block; background: #ff5252; color: #fff; font-weight: 700; padding: 4px 14px; border-radius: 999px; font-size: 0.8rem; }
            h1 { color: #ff5252; margin: 12px 0 6px; font-size: 1.6rem; }
            .btn { display: inline-block; padding: 12px 24px; border-radius: 999px; font-weight: 600; text-decoration: none; margin: 8px 4px; }
            .btn-wa { background: #25d366; color: #0b2214; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">MARKED REJECTED</span>
            <h1>Customer Notified</h1>
            <p style="color:#e4c7b6">An email was sent to <b>${esc(booking.email)}</b> requesting valid payment proof.</p>
            <div style="margin-top: 20px">
              <a href="${waLink}" target="_blank" class="btn btn-wa">💬 Message Customer on WhatsApp</a>
            </div>
          </div>
        </body>
      </html>`,
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  }

  return new Response("Unknown action", { status: 400 });
}
