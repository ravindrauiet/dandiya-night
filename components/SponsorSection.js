"use client";

import { useState } from "react";
import { EVENT } from "@/lib/event";

export default function SponsorSection() {
  const [activePoster, setActivePoster] = useState(null);

  const sponsorPosters = [
    {
      src: "/poster-dairy-cool-1.jpg",
      alt: "Dairy Cool - Proud Sponsor of Dandiya Night 2026 at Opulent Mall",
      title: "Dairy Cool · Pure Tradition Flyer",
      desc: "Kamlesh Gurjari · Buffalo Bilona Desi Ghee",
    },
    {
      src: "/poster-dairy-cool-2.jpg",
      alt: "Dairy Cool Buffalo Bilona Ghee - Proud Sponsor of Dandiya Night 2026",
      title: "Dairy Cool · Desi Swad Desi Apnapan",
      desc: "Traditional Bilona Method · Pure & Natural Ghee",
    },
  ];

  return (
    <section id="sponsor" className="section-sponsor">
      <div className="container">
        <div className="section-head">
          <div className="festive-badge">🥛 OFFICIAL TITLE SPONSOR</div>
          <h2>Proudly Sponsored by DAIRY COOL</h2>
          <p>
            A Brand by Kamlesh Gurjari · Desi Ghee · Desi Swad · Desi Apnapan
          </p>
        </div>

        <div className="sponsor-card card">
          <div className="sponsor-info">
            <div className="sponsor-logo-box">
              <span className="sponsor-tag">⭐ OFFICIAL TITLE SPONSOR</span>
              <h3 className="sponsor-name">{EVENT.sponsor.name}</h3>
              <p className="sponsor-by">{EVENT.sponsor.founder}</p>
              <div className="sponsor-tagline">&ldquo;{EVENT.sponsor.tagline}&rdquo;</div>
            </div>

            <p className="sponsor-desc">
              Experience the authentic taste of tradition! <strong>Dairy Cool</strong> brings pure, authentic Buffalo Bilona Ghee made with traditional techniques, keeping heritage, purity, and family love at its heart.
            </p>

            <div className="sponsor-features-grid">
              {EVENT.sponsor.features.map((feat, i) => (
                <div key={i} className="s-feat-item">
                  <span className="s-feat-check">🌿</span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="sponsor-motto-box">
              <span>❤️ &ldquo;{EVENT.sponsor.motto}&rdquo;</span>
            </div>

            <div className="sponsor-actions">
              <a href="#book" className="btn btn-primary btn-sm">
                🎟️ Book Event Passes Now
              </a>
            </div>
          </div>

          <div className="sponsor-flyers-col">
            <div className="sponsor-flyers-grid">
              {sponsorPosters.map((poster, index) => (
                <div
                  key={index}
                  className="s-flyer-card"
                  onClick={() => setActivePoster(poster)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActivePoster(poster)}
                >
                  <img src={poster.src} alt={poster.alt} className="s-flyer-img" loading="lazy" />
                  <div className="s-flyer-overlay">
                    <span>🔍 Tap to view flyer</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activePoster && (
        <div className="modal-backdrop" onClick={() => setActivePoster(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActivePoster(null)}>✕</button>
            <div className="modal-header">
              <h3>{activePoster.title}</h3>
              <p>{activePoster.desc}</p>
            </div>
            <div className="modal-body">
              <img src={activePoster.src} alt={activePoster.alt} className="modal-img" />
            </div>
            <div className="modal-footer">
              <a href={activePoster.src} target="_blank" rel="noreferrer" download className="btn btn-outline btn-sm">
                📥 Download Flyer
              </a>
              <button className="btn btn-primary btn-sm" onClick={() => setActivePoster(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
