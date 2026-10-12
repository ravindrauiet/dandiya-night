"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/event";

export default function StickyBookingBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past 400px
      if (window.scrollY > 420) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <aside className="sticky-mobile-bar" aria-label="Quick Booking Bar">
      <div className="sticky-content">
        <div className="sticky-info">
          <span className="sticky-title">{EVENT.name}</span>
          <span className="sticky-meta">{EVENT.date} · Passes from ₹199</span>
        </div>
        <a href="#book" className="btn btn-primary btn-sm sticky-btn">
          🎟️ Book Now
        </a>
      </div>
    </aside>
  );
}
