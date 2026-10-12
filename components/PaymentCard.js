"use client";

import { EVENT } from "@/lib/event";

export default function PaymentCard() {
  return (
    <aside className="card pay-card verification-info-card">
      <div className="pay-card-header">
        <span className="pay-tag">🛡️ OFFICIAL ORGANISER VERIFIED</span>
        <h2 className="pay-title">Verification &amp; Entry Hub</h2>
        <p className="pay-subtitle">Real-time attendee pass issuance &amp; direct organiser support</p>
      </div>

      {/* Process Flow Explainer */}
      <div className="verification-steps-box">
        <div className="v-step">
          <div className="v-step-num">1</div>
          <div className="v-step-text">
            <strong>Enter Details &amp; Choose Pass</strong>
            <p>Provide your name, phone &amp; email in the form on the left.</p>
          </div>
        </div>

        <div className="v-step">
          <div className="v-step-num">2</div>
          <div className="v-step-text">
            <strong>Custom Amount QR Generation</strong>
            <p>Your unique UPI QR code is automatically generated for your exact pass amount.</p>
          </div>
        </div>

        <div className="v-step">
          <div className="v-step-num">3</div>
          <div className="v-step-text">
            <strong>Upload Proof &amp; Send Pass</strong>
            <p>Attach your payment screenshot to generate your digital gate QR pass.</p>
          </div>
        </div>

        <div className="v-step">
          <div className="v-step-num">4</div>
          <div className="v-step-text">
            <strong>Multi-Channel Confirmation</strong>
            <p>Pass is emailed instantly + WhatsApp link opens to send pass directly to Rahul.</p>
          </div>
        </div>
      </div>

      <div className="verification-guarantee-box">
        <span className="v-badge">✓ Guaranteed Entry at Opulent Mall</span>
        <p className="v-sub">
          Digital entry pass QR is verified by our team and scanned directly at the venue entrance.
        </p>
      </div>

      <hr className="pay-divider" />

      {/* Organiser Contact Card */}
      <div className="organiser-contact-card">
        <div className="org-avatar">👑</div>
        <div className="org-info">
          <strong>{EVENT.payee}</strong>
          <div className="org-sub">Event Organiser · {EVENT.presenters}</div>
          <div className="org-phones">
            {EVENT.phones.map((phone) => (
              <a key={phone} href={`tel:${phone}`} className="phone-link">
                📞 {phone}
              </a>
            ))}
          </div>
          <div className="org-insta">
            <a
              href={`https://instagram.com/${EVENT.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="insta-link"
            >
              📸 @{EVENT.instagram}
            </a>
          </div>
        </div>
      </div>

      <div className="pay-quick-actions" style={{ marginTop: 16 }}>
        <a
          href={`https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent(
            "Hi Rahul, I have a question regarding Dandiya Night 2026 passes and payment verification."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm wa-help-btn"
        >
          💬 Chat with Organiser on WhatsApp
        </a>
      </div>
    </aside>
  );
}
