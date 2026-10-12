import crypto from "crypto";

const SECRET = process.env.EMAIL_PASS || process.env.SMTP_PASS || "dandiya-night-verification-secret-2026";

/**
 * Creates a tamper-proof signed token containing booking details
 */
export function createVerificationToken(booking) {
  const payload = JSON.stringify({
    ref: booking.ref,
    name: booking.name,
    mobile: booking.mobile,
    email: booking.email,
    ticketName: booking.ticketName,
    qty: booking.qty,
    total: booking.total,
    createdAt: booking.createdAt,
    ts: Date.now(),
  });

  const dataB64 = Buffer.from(payload).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(dataB64).digest("base64url");

  return `${dataB64}.${signature}`;
}

/**
 * Verifies and decodes the booking token
 */
export function verifyToken(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [dataB64, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", SECRET).update(dataB64).digest("base64url");

    if (signature !== expectedSig) {
      return null;
    }

    const jsonStr = Buffer.from(dataB64, "base64url").toString("utf-8");
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Token verification error:", err);
    return null;
  }
}
