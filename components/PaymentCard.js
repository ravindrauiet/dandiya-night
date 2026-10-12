"use client";

import { useState } from "react";
import { EVENT } from "@/lib/event";

export default function PaymentCard({ selectedTotal }) {
  const [copied, setCopied] = useState(false);
  const [qrZoom, setQrZoom] = useState(false);

  const amountParam = selectedTotal > 0 ? `&am=${selectedTotal}` : "";
  const upiLink = `upi://pay?pa=${EVENT.upiId}&pn=${encodeURIComponent(EVENT.payee)}&cu=INR${amountParam}`;

  const copyUpi = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(EVENT.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <>
      <aside className="card pay-card">
        <div className="pay-card-header">
          <span className="pay-tag">⚡ VERIFIED UPI GATEWAY</span>
          <h2 className="pay-title">Scan &amp; Pay</h2>
          <p className="pay-subtitle">Pay securely via any UPI App (GPay, PhonePe, Paytm, BHIM)</p>
        </div>

        {/* QR Code with zoom indicator */}
        <div className="upi-qr-wrapper" onClick={() => setQrZoom(true)} title="Click to enlarge QR">
          <img className="upi-qr-img" src="/upi-qr.png" alt="PhonePe UPI QR for Dandiya Night" />
          <div className="qr-overlay-hint">🔍 Tap to enlarge</div>
        </div>

        {/* UPI ID with Copy Button */}
        <div className="upi-details-box">
          <div className="upi-label-row">
            <span className="upi-lbl">UPI ID</span>
            <span className="upi-verified-badge">✓ Verified Merchant</span>
          </div>
          <div className="upi-code-row">
            <code className="upi-code-text">{EVENT.upiId}</code>
            <button
              type="button"
              className={`copy-btn ${copied ? "copied" : ""}`}
              onClick={copyUpi}
              aria-label="Copy UPI ID"
            >
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>
          <div className="payee-row">
            <span className="payee-name">Payee: <strong>{EVENT.payee}</strong></span>
            {selectedTotal > 0 && (
              <span className="amount-prompt">Pay: <strong>₹{selectedTotal}</strong></span>
            )}
          </div>
        </div>

        {/* Direct Action Buttons */}
        <div className="pay-quick-actions">
          <a href={upiLink} className="btn btn-primary btn-sm upi-open-btn">
            📱 Open in UPI App
          </a>
          <a
            href={`https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent(
              `Hi Rahul, I am booking Dandiya Night passes and have a question regarding payment.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm wa-help-btn"
          >
            💬 WhatsApp Help
          </a>
        </div>

        <div className="pay-steps-list">
          <div className="pay-step">
            <span className="step-num">1</span>
            <span>Scan QR or copy UPI ID above</span>
          </div>
          <div className="pay-step">
            <span className="step-num">2</span>
            <span>Transfer total pass amount</span>
          </div>
          <div className="pay-step">
            <span className="step-num">3</span>
            <span>Attach payment screenshot &amp; submit</span>
          </div>
        </div>

        <hr className="pay-divider" />

        <div className="organiser-contact-card">
          <div className="org-avatar">👑</div>
          <div className="org-info">
            <strong>{EVENT.payee}</strong>
            <div className="org-sub">{EVENT.presenters}</div>
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
      </aside>

      {/* QR Zoom Modal */}
      {qrZoom && (
        <div className="modal-backdrop" onClick={() => setQrZoom(false)}>
          <div className="modal-content modal-qr" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setQrZoom(false)}>✕</button>
            <div className="modal-header">
              <h3>UPI Payment QR</h3>
              <p>Scan with PhonePe, Google Pay, Paytm or any UPI app</p>
            </div>
            <div className="modal-body text-center">
              <img src="/upi-qr.png" alt="Enlarged UPI QR code" className="enlarged-qr" />
              <div className="enlarged-upi-text">{EVENT.upiId}</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={copyUpi}>
                {copied ? "✓ Copied UPI ID!" : "📋 Copy UPI ID"}
              </button>
              <a href={upiLink} className="btn btn-primary btn-sm">
                📱 Pay via UPI
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
