"use client";

import { useState } from "react";

export default function PosterLightbox() {
  const [activePoster, setActivePoster] = useState(null);

  const posters = [
    {
      src: "/poster-1.jpg",
      alt: "Dandiya Night 2026 Official Event Poster at Opulent Mall",
      title: "Official Event Flyer",
      badge: "Main Announcement",
      desc: "Saturday 17 October · Opulent Mall, Ghaziabad",
    },
    {
      src: "/poster-2.jpg",
      alt: "The Dandiya Night at Opulent Mall Event Schedule Poster",
      title: "Venue & Artists Poster",
      badge: "Pass Details",
      desc: "Live DJ, Competitions, Food Stalls & Hampers",
    },
  ];

  return (
    <>
      <div className="posters-showcase">
        <div className="posters-header">
          <span className="poster-pill">📸 OFFICIAL EVENT FLYERS</span>
          <p className="poster-subtext">Click any flyer to view in high resolution</p>
        </div>
        <div className="posters-grid">
          {posters.map((poster, index) => (
            <div
              key={index}
              className="poster-card-wrap"
              onClick={() => setActivePoster(poster)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActivePoster(poster)}
            >
              <div className="poster-card">
                <span className="poster-tag">{poster.badge}</span>
                <img
                  className="poster-img"
                  src={poster.src}
                  alt={poster.alt}
                  loading="lazy"
                />
                <div className="poster-overlay">
                  <span className="zoom-icon">🔍 Tap to Expand</span>
                  <span className="poster-title">{poster.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activePoster && (
        <div className="modal-backdrop" onClick={() => setActivePoster(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setActivePoster(null)}
              aria-label="Close poster"
            >
              ✕
            </button>
            <div className="modal-header">
              <h3>{activePoster.title}</h3>
              <p>{activePoster.desc || activePoster.alt}</p>
            </div>
            <div className="modal-body">
              <img
                src={activePoster.src}
                alt={activePoster.alt}
                className="modal-img"
              />
            </div>
            <div className="modal-footer">
              <a
                href={activePoster.src}
                target="_blank"
                rel="noreferrer"
                download
                className="btn btn-outline btn-sm"
              >
                📥 Download Flyer
              </a>
              <a href="#book" onClick={() => setActivePoster(null)} className="btn btn-primary btn-sm">
                🎟️ Book Passes Now
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
