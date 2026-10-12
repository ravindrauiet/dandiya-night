"use client";

import { useEffect, useState, useRef } from "react";
import { TICKETS, EVENT, formatPrice } from "@/lib/event";

const MAX_MB = 4; // Max image size

export default function BookingForm({ onTicketChange }) {
  const [ticket, setTicket] = useState("couple"); // default to popular pass
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
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

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ type: "", msg: "" });
    const form = e.currentTarget;
    const data = new FormData(form);

    let file = data.get("screenshot");
    // Ensure selectedFile from state is used if input value was lost
    if ((!file || !file.size) && selectedFile) {
      file = selectedFile;
      data.set("screenshot", selectedFile);
    }

    if (selected?.price > 0) {
      if (!file || !file.size) {
        return setStatus({ type: "err", msg: "Please attach your UPI payment screenshot before submitting." });
      }
      if (!file.type.startsWith("image/")) {
        return setStatus({ type: "err", msg: "Payment screenshot must be an image." });
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        return setStatus({ type: "err", msg: `Screenshot must be under ${MAX_MB} MB.` });
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/book", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission error occurred.");
      setResult(json);
      form.reset();
      clearFile();
    } catch (err) {
      setStatus({ type: "err", msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  const printTicket = () => {
    window.print();
  };

  if (result) {
    return (
      <div className="card receipt-card print-ticket-area">
        <div className="receipt-confetti-badge">🎉 BOOKING CONFIRMED!</div>
        <div className="receipt-header">
          <span className="tag-vip">OFFICIAL ENTRY PASS</span>
          <h3 className="receipt-title">{EVENT.name}</h3>
          <p className="receipt-sub">{EVENT.date} · {EVENT.time}</p>
          <p className="receipt-venue">{EVENT.venue}</p>
        </div>

        <div className="receipt-qr-box">
          <img src={result.qr} alt="Booking QR code" className="receipt-qr-img" />
          <span className="receipt-qr-lbl">Scan at Gate for Entry</span>
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
        </dl>

        <div className="alert alert-ok">
          {result.booking.email ? (
            <>
              📧 A confirmation copy with this QR pass has been sent to <strong>{result.booking.email}</strong>.
            </>
          ) : (
            "📸 Please take a screenshot of this entry pass and QR code for hassle-free entry."
          )}
          <br />
          Entry becomes active upon organiser payment verification.
        </div>

        <div className="receipt-actions no-print">
          <button type="button" className="btn btn-primary btn-sm" onClick={printTicket}>
            🖨️ Print / Save Pass
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setResult(null);
              setTicket("individual");
              setQty(1);
            }}
          >
            + Book Another Pass
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="card booking-form-card" onSubmit={onSubmit} noValidate={false}>
      <div className="form-header">
        <span className="form-tag">🎟️ INSTANT PASS RESERVATION</span>
        <h2 className="form-title">Enter Attendee Details</h2>
        <p className="form-desc">Fill in your information to receive your digital QR entry pass</p>
      </div>

      {/* Ticket Selection Selector Pills */}
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

      {/* Hidden input to pass ticket to formData */}
      <input type="hidden" name="ticket" value={ticket} />

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
            placeholder="10-digit number"
            required
            inputMode="numeric"
            pattern="[6-9][0-9]{9}"
            title="10-digit Indian mobile number starting with 6, 7, 8, or 9"
            maxLength={10}
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

      {/* Payment Screenshot Upload with Live Preview */}
      <div className="upload-box-wrapper">
        <label className="form-label" htmlFor="screenshot">
          Payment Screenshot {selected?.price === 0 ? "(Optional for Free Passes)" : <span className="req">*</span>}
        </label>

        {/* Persistently mounted hidden file input so selected file is never cleared by React re-renders */}
        <input
          ref={fileInputRef}
          className="file-hidden-input"
          id="screenshot"
          name="screenshot"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

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
              <strong>Click to upload payment screenshot</strong>
              <span>JPG, PNG or WebP under {MAX_MB}MB</span>
            </div>
          </div>
        ) : (
          <div className="upload-preview-box">
            <img src={previewUrl} alt="Payment proof preview" className="preview-thumb" />
            <div className="preview-meta">
              <span className="preview-ok">✓ Screenshot Selected</span>
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
        <p className="hint">
          Scan the QR code on the right, pay via your UPI app, and attach the transaction screenshot here.
        </p>
      </div>

      {/* Order Total Summary */}
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

      <button
        className="btn btn-primary submit-booking-btn"
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <span className="btn-spinner">Submitting Your Booking…</span>
        ) : (
          <span>🎟️ Complete &amp; Generate QR Pass ({selected ? formatPrice(total) : "—"})</span>
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
