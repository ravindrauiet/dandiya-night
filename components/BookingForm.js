"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import QRCode from "qrcode";
import { TICKETS, EVENT, formatPrice } from "@/lib/event";

const MAX_MB = 4; // Max image size

export default function BookingForm({ onTicketChange }) {
  // Step 1: Info & Pass Selection | Step 2: Custom Amount QR & Screenshot Upload
  const [step, setStep] = useState(1);
  const [ticket, setTicket] = useState("couple"); // default to popular pass
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [upiQrUrl, setUpiQrUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

  // Pre-select a ticket when user clicked "Select" from pass cards or query param
  useEffect(() => {
    const handleLocationChange = () => {
      const t = new URLSearchParams(window.location.search).get("ticket");
      if (t && TICKETS.some((x) => x.id === t)) {
        setTicket(t);
        if (onTicketChange) onTicketChange(t);
      }
    };

    handleLocationChange();
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, [onTicketChange]);

  const selected = TICKETS.find((t) => t.id === ticket);
  const total = selected ? selected.price * qty : 0;

  // Generate dynamic exact-price UPI QR code
  useEffect(() => {
    if (total > 0 && selected) {
      const upiUrl = `upi://pay?pa=${EVENT.upiId}&pn=${encodeURIComponent(
        EVENT.payee
      )}&am=${total}&cu=INR&tn=${encodeURIComponent(`Dandiya ${selected.name} Pass`)}`;

      QRCode.toDataURL(upiUrl, {
        width: 380,
        margin: 2,
        color: {
          dark: "#100416",
          light: "#ffffff",
        },
      })
        .then((url) => setUpiQrUrl(url))
        .catch((err) => console.error("Error generating UPI QR:", err));
    } else {
      setUpiQrUrl("");
    }
  }, [total, selected]);

  const handleTicketSelect = (id) => {
    setTicket(id);
    if (onTicketChange) onTicketChange(id);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setStatus({ type: "err", msg: "Only image files (JPG, PNG, WebP) are allowed." });
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        setStatus({ type: "err", msg: `Screenshot exceeds ${MAX_MB} MB limit.` });
        return;
      }
      setStatus({ type: "", msg: "" });
      setSelectedFile(file);
      setSelectedFileName(file.name);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedFileName("");
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyUpi = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(EVENT.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    if (!name.trim()) {
      setStatus({ type: "err", msg: "Please enter your full name." });
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      setStatus({ type: "err", msg: "Please enter a valid 10-digit Indian mobile number." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus({ type: "err", msg: "Please enter a valid email address." });
      return;
    }

    // If free pass, submit immediately
    if (total === 0) {
      handleFinalSubmit();
      return;
    }

    setStep(2);
    // Smooth scroll slightly so the payment QR is prominent
    const el = document.getElementById("book");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Final Submission to API
  async function handleFinalSubmit(e) {
    if (e) e.preventDefault();
    setStatus({ type: "", msg: "" });

    if (total > 0 && (!selectedFile || !selectedFile.size)) {
      setStatus({ type: "err", msg: "Please attach your UPI payment screenshot before submitting." });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("mobile", mobile.trim());
    formData.set("email", email.trim());
    formData.set("ticket", ticket);
    formData.set("qty", String(qty));
    if (selectedFile) {
      formData.set("screenshot", selectedFile);
    }

    try {
      const res = await fetch("/api/book", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission error occurred.");
      setResult(json);
      clearFile();
      setStep(1);
    } catch (err) {
      setStatus({ type: "err", msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  const printTicket = () => {
    window.print();
  };

  const amountParam = total > 0 ? `&am=${total}` : "";
  const upiDeepLink = `upi://pay?pa=${EVENT.upiId}&pn=${encodeURIComponent(
    EVENT.payee
  )}&cu=INR${amountParam}&tn=${encodeURIComponent(`Dandiya Pass ${name || ""}`)}`;

  // ==========================================
  // VIEW: RESULT / CONFIRMATION SCREEN (PENDING VERIFICATION)
  // ==========================================
  if (result) {
    const whatsappText = `Hi Rahul! I have submitted my booking request for Dandiya Night 2026.
🎫 Booking Ref: ${result.booking.ref}
👤 Name: ${result.booking.name}
🎟️ Pass: ${result.booking.ticketName} (x${result.booking.qty})
💰 Total Amount: ${formatPrice(result.booking.total)}
📱 Mobile: ${result.booking.mobile}
📧 Email: ${result.booking.email}

Please find my payment screenshot attached for quick verification & entry pass generation.`;

    const whatsappUrl = `https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent(whatsappText)}`;

    return (
      <div className="card receipt-card print-ticket-area">
        <div className="receipt-confetti-badge" style={{ color: "var(--gold)" }}>
          ⏳ BOOKING REQUEST SUBMITTED
        </div>

        <div className="receipt-header">
          <span className="tag-vip" style={{ background: "rgba(255, 201, 74, 0.2)", color: "var(--gold)", border: "1px solid var(--gold)" }}>
            PENDING ORGANISER VERIFICATION
          </span>
          <h3 className="receipt-title">{EVENT.name}</h3>
          <p className="receipt-sub">{EVENT.date} · {EVENT.time}</p>
          <p className="receipt-venue">{EVENT.venue}</p>
        </div>

        {/* Security / Verification Status Box */}
        <div className="alert alert-ok" style={{ textAlign: "left", marginTop: 18, background: "rgba(255, 201, 74, 0.1)", borderColor: "var(--gold)" }}>
          <strong style={{ color: "var(--gold)" }}>🛡️ Verification in Progress:</strong>
          <p style={{ margin: "6px 0 0", fontSize: "0.88rem", color: "var(--text)" }}>
            Your payment screenshot has been sent to our event managers. To prevent invalid bookings, our team verifies all UPI transactions against bank records.
          </p>
          <p style={{ margin: "6px 0 0", fontSize: "0.88rem", color: "var(--muted)" }}>
            Once approved, your official <strong>Gate Entry Ticket &amp; QR Code</strong> will be sent to <strong>{result.booking.email}</strong>.
          </p>
        </div>

        <dl className="receipt-details">
          <dt>Booking Ref:</dt>
          <dd className="ref-highlight">{result.booking.ref}</dd>

          <dt>Attendee Name:</dt>
          <dd>{result.booking.name}</dd>

          <dt>Pass Type:</dt>
          <dd>{result.booking.ticketName}</dd>

          <dt>Total Passes:</dt>
          <dd>{result.booking.qty} Pass{result.booking.qty > 1 ? "es" : ""}</dd>

          <dt>Total Amount:</dt>
          <dd className="total-highlight">{formatPrice(result.booking.total)}</dd>

          <dt>Mobile Number:</dt>
          <dd>{result.booking.mobile}</dd>

          <dt>Verification Status:</dt>
          <dd style={{ color: "var(--gold)" }}>Under Review by Admin</dd>
        </dl>

        {/* WhatsApp Direct Connect Action for Fast Verification */}
        <div className="receipt-wa-card no-print">
          <div className="wa-card-text">
            <strong>📲 Want Instant Approval?</strong>
            <p>Send your reference number and payment screenshot directly to Rahul Dhaundiyal on WhatsApp for priority approval:</p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm wa-send-btn"
          >
            💬 Fast-Track via WhatsApp ➔
          </a>
        </div>

        <div className="receipt-actions no-print">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setResult(null);
              setTicket("couple");
              setQty(1);
              setName("");
              setMobile("");
              setEmail("");
              setStep(1);
            }}
          >
            + Submit Another Booking
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: STEP 1 - FILL INFORMATION & SELECT PASS
  // ==========================================
  if (step === 1) {
    return (
      <form className="card booking-form-card" onSubmit={handleProceedToPayment}>
        <div className="form-header">
          <div className="step-indicator">
            <span className="step-badge active">Step 1: Your Details</span>
            <span className="step-badge-line" />
            <span className="step-badge">Step 2: Pay &amp; Verify</span>
          </div>
          <h2 className="form-title">Enter Attendee Details</h2>
          <p className="form-desc">
            Fill your contact details to generate your custom-amount payment QR code.
          </p>
        </div>

        {/* Pass Type Pills */}
        <div className="ticket-pill-selector">
          <label className="form-label" style={{ marginTop: 0 }}>
            Select Pass Type <span className="req">*</span>
          </label>
          <div className="pill-grid">
            {TICKETS.map((t) => {
              const isSelected = ticket === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => handleTicketSelect(t.id)}
                  className={`ticket-pill ${isSelected ? "pill-active" : ""}`}
                >
                  <div className="pill-top">
                    <span className="pill-name">{t.name}</span>
                    {t.badge && <span className="pill-badge">{t.badge}</span>}
                  </div>
                  <div className="pill-price">{formatPrice(t.price)}</div>
                  <div className="pill-people">{t.people}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Full Name */}
        <div className="field-group">
          <label className="form-label" htmlFor="name">
            Primary Attendee Name <span className="req">*</span>
          </label>
          <input
            className="input"
            id="name"
            name="name"
            placeholder="e.g. Rahul Sharma"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>

        {/* Mobile & Email Row */}
        <div className="row">
          <div className="field-group">
            <label className="form-label" htmlFor="mobile">
              Mobile Number (WhatsApp) <span className="req">*</span>
            </label>
            <input
              className="input"
              id="mobile"
              name="mobile"
              placeholder="10-digit mobile"
              required
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              title="10-digit Indian mobile number"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <div className="field-group">
            <label className="form-label" htmlFor="email">
              Email Address <span className="req">*</span>
            </label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              placeholder="For QR pass delivery"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
        </div>
        <p className="hint">Your digital entry pass with QR code will be emailed here instantly.</p>

        {/* Quantity Stepper */}
        <div className="qty-row">
          <label className="form-label" htmlFor="qty" style={{ margin: 0 }}>
            Number of Passes <span className="req">*</span>
          </label>
          <div className="stepper-wrap">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={qty <= 1}
              aria-label="Decrease passes"
            >
              −
            </button>
            <input
              className="stepper-input"
              id="qty"
              name="qty"
              type="number"
              min={1}
              max={20}
              required
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            />
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setQty(Math.min(20, qty + 1))}
              disabled={qty >= 20}
              aria-label="Increase passes"
            >
              +
            </button>
          </div>
        </div>

        {/* Total Summary */}
        <div className="total-summary-card">
          <div className="total-row-item">
            <span>Pass Type:</span>
            <strong>{selected ? selected.name : "None selected"}</strong>
          </div>
          <div className="total-row-item">
            <span>Quantity:</span>
            <strong>{qty} {qty > 1 ? "passes" : "pass"}</strong>
          </div>
          <div className="total-row-item grand-total">
            <span>Total Payable:</span>
            <span className="grand-amount">{selected ? formatPrice(total) : "—"}</span>
          </div>
        </div>

        {status.msg && (
          <div className={`alert ${status.type === "err" ? "alert-err" : "alert-ok"}`}>
            {status.type === "err" ? "⚠️ " : "✓ "} {status.msg}
          </div>
        )}

        <button className="btn btn-primary submit-booking-btn" type="submit">
          {total === 0 ? (
            "🎟️ Submit Free Registration"
          ) : (
            `Generate Payment QR for ${formatPrice(total)} ➔`
          )}
        </button>

        <div className="trust-footer-badges">
          <span>🔒 100% Verified Entry</span>
          <span>⚡ Instant QR Delivery</span>
          <span>🤝 Official Organiser</span>
        </div>
      </form>
    );
  }

  // ==========================================
  // VIEW: STEP 2 - DYNAMIC QR CODE & SCREENSHOT UPLOAD
  // ==========================================
  return (
    <div className="card booking-form-card">
      <div className="form-header">
        <div className="step-indicator">
          <span className="step-badge done" onClick={() => setStep(1)} style={{ cursor: "pointer" }}>
            ✓ Step 1: Details
          </span>
          <span className="step-badge-line active" />
          <span className="step-badge active">Step 2: Pay &amp; Verify</span>
        </div>
        <h2 className="form-title">Scan QR &amp; Pay Exact Amount</h2>
        <p className="form-desc">
          Scan the generated QR code below with any UPI app to pay <strong>{formatPrice(total)}</strong>.
        </p>
      </div>

      {/* Generated Custom Amount QR Box */}
      <div className="dynamic-qr-box">
        <div className="qr-amount-pill">
          Pay Exact: <strong>{formatPrice(total)}</strong>
        </div>

        {upiQrUrl ? (
          <img src={upiQrUrl} alt={`UPI QR for ${formatPrice(total)}`} className="dynamic-qr-img" />
        ) : (
          <div className="qr-loading">Generating exact amount QR code…</div>
        )}

        <div className="upi-details-row">
          <span className="upi-id-tag">UPI ID: <strong>{EVENT.upiId}</strong></span>
          <button type="button" className={`copy-btn ${copied ? "copied" : ""}`} onClick={copyUpi}>
            {copied ? "✓ Copied!" : "📋 Copy UPI"}
          </button>
        </div>

        <div className="pay-quick-actions" style={{ marginTop: 12 }}>
          <a href={upiDeepLink} className="btn btn-primary btn-sm upi-open-btn">
            📱 Open in UPI App (GPay/PhonePe/Paytm)
          </a>
        </div>
        <p className="hint" style={{ marginTop: 6 }}>
          Amount <strong>{formatPrice(total)}</strong> is pre-encoded into this QR code.
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        id="screenshot"
        name="screenshot"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Upload Screenshot Dropzone */}
      <div className="upload-box-wrapper" style={{ marginTop: 22 }}>
        <label className="form-label" htmlFor="screenshot" style={{ marginTop: 0 }}>
          Upload Payment Screenshot <span className="req">*</span>
        </label>

        {!previewUrl ? (
          <div
            className="upload-dropzone"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
          >
            <span className="upload-icon">📸</span>
            <div className="upload-text">
              <strong>Tap to upload your payment screenshot</strong>
              <span>Attach your UPI transaction success receipt</span>
            </div>
          </div>
        ) : (
          <div className="upload-preview-box">
            <img src={previewUrl} alt="Payment proof preview" className="preview-thumb" />
            <div className="preview-meta">
              <span className="preview-ok">✓ Screenshot Attached</span>
              <span className="preview-filename">{selectedFileName}</span>
            </div>
            <button
              type="button"
              className="preview-remove-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Change screenshot"
            >
              🔄 Change
            </button>
            <button
              type="button"
              className="preview-remove-btn"
              onClick={clearFile}
              title="Remove image"
              style={{ marginLeft: 6 }}
            >
              ✕ Remove
            </button>
          </div>
        )}
      </div>

      {status.msg && (
        <div className={`alert ${status.type === "err" ? "alert-err" : "alert-ok"}`}>
          {status.type === "err" ? "⚠️ " : "✓ "} {status.msg}
        </div>
      )}

      {/* Action Buttons */}
      <div className="step-actions-row">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setStep(1)}
          disabled={loading}
        >
          ⬅️ Edit Details
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleFinalSubmit}
          disabled={loading}
          style={{ flexGrow: 1 }}
        >
          {loading ? (
            <span className="btn-spinner">Verifying &amp; Generating Pass…</span>
          ) : (
            <span>🎟️ Send Ticket &amp; Confirm Booking ({formatPrice(total)})</span>
          )}
        </button>
      </div>

      <div className="trust-footer-badges">
        <span>📧 Instant Email Delivery</span>
        <span>💬 WhatsApp Instant Pass Share</span>
        <span>👑 Organiser Verified</span>
      </div>
    </div>
  );
}
