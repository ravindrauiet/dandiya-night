import { EVENT, TICKETS, HIGHLIGHTS, formatPrice } from "@/lib/event";
import BookingForm from "@/components/BookingForm";
import PaymentCard from "@/components/PaymentCard";
import CountdownTimer from "@/components/CountdownTimer";
import PosterLightbox from "@/components/PosterLightbox";
import SponsorSection from "@/components/SponsorSection";
import ScheduleTimeline from "@/components/ScheduleTimeline";
import VenueCard from "@/components/VenueCard";
import FaqSection from "@/components/FaqSection";
import StickyBookingBar from "@/components/StickyBookingBar";

export default function Home() {
  return (
    <>
      {/* Decorative Festive Background Elements */}
      <div className="festive-glow glow-1" aria-hidden="true" />
      <div className="festive-glow glow-2" aria-hidden="true" />
      <div className="festive-glow glow-3" aria-hidden="true" />

      {/* Top Navigation */}
      <nav className="nav">
        <div className="container nav-container">
          <a href="#" className="logo">
            <span className="logo-icon">🪔</span>
            <span>DANDIYA NIGHT <span className="logo-year">2026</span></span>
          </a>
          <div className="nav-links">
            <a href="#tickets">Passes</a>
            <a href="#sponsor">Sponsor</a>
            <a href="#highlights">Highlights</a>
            <a href="#schedule">Schedule</a>
            <a href="#venue">Venue</a>
            <a href="#faq">FAQs</a>
          </div>
          <div className="nav-actions">
            <a href="#book" className="btn btn-primary btn-sm nav-book-btn">
              🎟️ Book Passes
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="container">
          <div className="hero-top-badge">
            <span className="sparkle-icon">✨</span>
            <span>{EVENT.presenters} Present</span>
          </div>

          <h1 className="hero-title">{EVENT.name}</h1>
          <p className="hero-tagline">{EVENT.tagline}</p>

          <div className="hero-meta-badges">
            <div className="meta-badge">
              <span className="badge-icon">📅</span>
              <span>{EVENT.date}</span>
            </div>
            <div className="meta-badge">
              <span className="badge-icon">⏰</span>
              <span>{EVENT.time}</span>
            </div>
            <div className="meta-badge venue-badge">
              <span className="badge-icon">📍</span>
              <span>{EVENT.venue}</span>
            </div>
          </div>

          {/* Live Countdown Timer */}
          <CountdownTimer />

          <div className="hero-actions">
            <a href="#book" className="btn btn-primary btn-lg">
              🎟️ Book Your Entry Pass
            </a>
            <a href="#tickets" className="btn btn-outline btn-lg">
              View Passes from ₹199
            </a>
            <a
              href={`https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent("Hi Rahul, I would like to know more about Dandiya Night 2026.")}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-glass btn-lg"
            >
              💬 WhatsApp Organiser
            </a>
          </div>

          {/* Quick Value Pillars */}
          <div className="hero-features-bar">
            <div className="feature-pill">
              <span className="pill-ico">🎧</span>
              <span>Non-stop Bollywood &amp; Garba DJ</span>
            </div>
            <div className="feature-pill">
              <span className="pill-ico">🏆</span>
              <span>Exciting Prizes &amp; Movie Tickets</span>
            </div>
            <div className="feature-pill">
              <span className="pill-ico">🍴</span>
              <span>Food &amp; Chaat Stalls</span>
            </div>
            <div className="feature-pill">
              <span className="pill-ico">👨‍👩‍👧</span>
              <span>Family &amp; Couple Friendly</span>
            </div>
          </div>

          {/* Official Posters Showcase with Modal Lightbox */}
          <PosterLightbox />
        </div>
      </header>

      {/* Tickets / Passes Section */}
      <section id="tickets" className="section-tickets">
        <div className="container">
          <div className="section-head">
            <div className="festive-badge">🎟️ PASS PACKAGES</div>
            <h2>Choose Your Entry Pass</h2>
            <p>Festive beats, energetic dandiya, mouth-watering food, and exciting contest prizes</p>
          </div>

          <div className="grid grid-4 tickets-grid">
            {TICKETS.map((t) => (
              <div
                key={t.id}
                className={`card ticket-card ${t.isPopular ? "card-popular" : ""} ${t.isBestValue ? "card-best-value" : ""}`}
              >
                {t.badge && <span className="ticket-badge">{t.badge}</span>}
                <h3 className="ticket-type">{t.name}</h3>
                <div className="ticket-pricing">
                  <span className="ticket-price">{formatPrice(t.price)}</span>
                  <span className="ticket-people">{t.people}</span>
                </div>

                <ul className="perks-list">
                  {t.perks?.map((perk, idx) => (
                    <li key={idx}>
                      <span className="perk-check">✓</span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={`?ticket=${t.id}#book`}
                  className={`btn ${t.isPopular || t.isBestValue ? "btn-primary" : "btn-outline"} btn-sm ticket-select-btn`}
                >
                  Select This Pass ➔
                </a>
              </div>
            ))}
          </div>

          <div className="ticket-guarantee-note">
            <span>🛡️ Instant QR Code generated on screen &amp; sent directly to your email</span>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section id="highlights" className="section-highlights">
        <div className="container">
          <div className="section-head">
            <div className="festive-badge">✨ EVENT ATTRACTIONS</div>
            <h2>The Night&apos;s Highlights</h2>
            <p>Immerse yourself in high-energy music, colorful dandiya dance, and festive celebrations</p>
          </div>
          <div className="grid grid-3 highlights-grid">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="card highlight-card">
                <div className="highlight-icon-wrap">
                  <span className="highlight-icon">{h.icon}</span>
                  {h.badge && <span className="highlight-tag">{h.badge}</span>}
                </div>
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Official Title Sponsor Section - Dairy Cool (Above The Flow of the Night) */}
      <SponsorSection />

      {/* Schedule / Flow of the Evening */}
      <ScheduleTimeline />

      {/* Venue Section */}
      <VenueCard />

      {/* Booking Form & Payment Card Section */}
      <section id="book" className="section-booking">
        <div className="container">
          <div className="section-head">
            <div className="festive-badge">⚡ SECURE PASS BOOKING</div>
            <h2>Book Your Tickets Now</h2>
            <p>Pay via UPI, attach your payment screenshot, and receive your digital QR entry pass instantly</p>
          </div>
          <div className="book-grid">
            <BookingForm />
            <PaymentCard />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection />

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="footer-logo">🪔 DANDIYA NIGHT 2026</div>
            <p className="footer-desc">
              Organised with pride by <strong>{EVENT.presenters}</strong>.<br />
              Celebrating the spirit of Navratri at {EVENT.venue}.
            </p>
          </div>

          <div className="footer-contact">
            <div className="footer-heading">Need Assistance?</div>
            <p>
              Direct Helpline:{" "}
              {EVENT.phones.map((p, i) => (
                <span key={p}>
                  <a href={`tel:${p}`} className="footer-link">{p}</a>
                  {i < EVENT.phones.length - 1 ? " · " : ""}
                </span>
              ))}
            </p>
            <p>
              Instagram:{" "}
              <a
                href={`https://instagram.com/${EVENT.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                @{EVENT.instagram}
              </a>
            </p>
            <p>
              WhatsApp Support:{" "}
              <a
                href={`https://wa.me/${EVENT.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                +91 {EVENT.whatsapp}
              </a>
            </p>
          </div>

          <div className="footer-bottom">
            <div>© 2026 {EVENT.name}. All rights reserved. Opulent Mall, Ghaziabad.</div>
            <div className="footer-bottom-links">
              <a href="#tickets">Passes</a>
              <span>·</span>
              <a href="#schedule">Schedule</a>
              <span>·</span>
              <a href="#venue">Venue</a>
              <span>·</span>
              <a href="#book">Book Tickets</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile Quick Booking Bar */}
      <StickyBookingBar />
    </>
  );
}
