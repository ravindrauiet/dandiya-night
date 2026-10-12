import { EVENT } from "@/lib/event";

export default function PaymentCard() {
  const upiLink = `upi://pay?pa=${EVENT.upiId}&pn=${encodeURIComponent(EVENT.payee)}&cu=INR`;
  return (
    <aside className="card pay">
      <p className="hint" style={{ marginTop: 0 }}>UPI payment</p>
      <h2 style={{ fontFamily: "Yatra One, serif", color: "var(--gold)" }}>Scan &amp; Pay</h2>
      {/* Put your PhonePe/UPI QR image in /public as upi-qr.png */}
      <img className="upi-qr" src="/upi-qr.png" alt="PhonePe payment QR" />
      <div className="upi">{EVENT.upiId}</div>
      <div className="hint">Payee: {EVENT.payee}</div>
      <a href={upiLink} className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>Open UPI app</a>
      <hr />
      <p className="org">
        After paying, attach the screenshot in the form. Your entry is confirmed once the organiser verifies the payment.
      </p>
      <p style={{ marginTop: 12 }}>
        <strong>{EVENT.payee}</strong><br />
        {EVENT.phones.join(" · ")}<br />
        @{EVENT.instagram}
      </p>
      <a href={`https://wa.me/${EVENT.whatsapp}`} target="_blank" rel="noopener noreferrer"
        className="btn btn-outline btn-sm" style={{ marginTop: 14 }}>WhatsApp organiser</a>
    </aside>
  );
}
