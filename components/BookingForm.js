"use client";

import { useEffect, useState } from "react";
import { TICKETS, EVENT, formatPrice } from "@/lib/event";

const MAX_MB = 4; // Vercel limits request bodies to ~4.5 MB

export default function BookingForm() {
  const [ticket, setTicket] = useState("");
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Pre-select a ticket when the user clicks "Select" on a pass card
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("ticket");
    if (t && TICKETS.some((x) => x.id === t)) setTicket(t);
  }, []);

  const selected = TICKETS.find((t) => t.id === ticket);
  const total = selected ? selected.price * qty : 0;

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ type: "", msg: "" });
    const form = e.currentTarget;
    const data = new FormData(form);

    const file = data.get("screenshot");
    if (selected?.price > 0) {
      if (!file || !file.size) return setStatus({ type: "err", msg: "Please attach your UPI payment screenshot." });
      if (!file.type.startsWith("image/")) return setStatus({ type: "err", msg: "Screenshot must be an image." });
      if (file.size > MAX_MB * 1024 * 1024) return setStatus({ type: "err", msg: `Screenshot must be under ${MAX_MB} MB.` });
    }

    setLoading(true);
    try {
      const res = await fetch("/api/book", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setResult(json);
      form.reset();
      setTicket("");
      setQty(1);
    } catch (err) {
      setStatus({ type: "err", msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="card receipt">
        <span className="tag">BOOKING REQUEST RECEIVED</span>
        <h3>{EVENT.name}</h3>
        <img src={result.qr} alt="Booking QR code" />
        <dl>
          <dt>Reference</dt><dd>{result.booking.ref}</dd>
          <dt>Name</dt><dd>{result.booking.name}</dd>
          <dt>Ticket</dt><dd>{result.booking.ticketName}</dd>
          <dt>Quantity</dt><dd>{result.booking.qty}</dd>
          <dt>Total</dt><dd>{formatPrice(result.booking.total)}</dd>
        </dl>
        <div className="alert alert-ok">
          {result.booking.email
            ? `The QR code and booking details have been emailed to ${result.booking.email}.`
            : "Save this screen — take a screenshot of the QR code."}{" "}
          Entry is valid once the organiser verifies your payment.
        </div>
        <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={() => setResult(null)}>
          Make another booking
        </button>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={onSubmit} noValidate={false}>
      <p className="hint" style={{ marginTop: 0 }}>Booking request</p>
      <h2 style={{ fontSize: "1.4rem" }}>Your details</h2>

      <label className="form-label" htmlFor="name">Full name <span className="req">*</span></label>
      <input className="input" id="name" name="name" required maxLength={80} autoComplete="name" />

      <div className="row">
        <div>
          <label className="form-label" htmlFor="mobile">Mobile number <span className="req">*</span></label>
          <input className="input" id="mobile" name="mobile" required inputMode="numeric"
            pattern="[6-9][0-9]{9}" title="10-digit Indian mobile number" maxLength={10} autoComplete="tel" />
        </div>
        <div>
          <label className="form-label" htmlFor="email">Email <span className="req">*</span></label>
          <input className="input" id="email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>
      <p className="hint">Your QR code will be sent to this email.</p>

      <div className="row">
        <div>
          <label className="form-label" htmlFor="ticket">Ticket type <span className="req">*</span></label>
          <select className="select" id="ticket" name="ticket" required value={ticket}
            onChange={(e) => setTicket(e.target.value)}>
            <option value="">Choose ticket</option>
            {TICKETS.map((t) => (
              <option key={t.id} value={t.id}>{t.name} · {formatPrice(t.price)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label" htmlFor="qty">Number of passes <span className="req">*</span></label>
          <input className="input" id="qty" name="qty" type="number" min={1} max={20} required
            value={qty} onChange={(e) => setQty(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} />
        </div>
      </div>

      <label className="form-label" htmlFor="screenshot">
        Payment screenshot {selected?.price === 0 ? "(not needed for free passes)" : <span className="req">*</span>}
      </label>
      <input className="input" id="screenshot" name="screenshot" type="file" accept="image/*" />
      <p className="hint">Attach a screenshot of your UPI payment. Images only, max {MAX_MB} MB.</p>

      <div className="total">
        <span>Total</span>
        <span>{selected ? formatPrice(total) : "—"}</span>
      </div>

      {status.msg && <div className={`alert ${status.type === "err" ? "alert-err" : "alert-ok"}`}>{status.msg}</div>}

      <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 18 }}>
        {loading ? "Submitting…" : "Submit booking request"}
      </button>
    </form>
  );
}
