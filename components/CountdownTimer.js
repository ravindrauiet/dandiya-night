"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/event";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = new Date(EVENT.targetDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isLive: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="countdown-wrap">
        <div className="countdown-badge">⏳ Counting Down to the Celebration</div>
        <div className="countdown-grid">
          <div className="countdown-card"><span className="num">--</span><span className="lbl">Days</span></div>
          <div className="countdown-card"><span className="num">--</span><span className="lbl">Hours</span></div>
          <div className="countdown-card"><span className="num">--</span><span className="lbl">Mins</span></div>
          <div className="countdown-card"><span className="num">--</span><span className="lbl">Secs</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="countdown-wrap">
      <div className="countdown-badge">
        <span className="live-dot" />
        {timeLeft.isLive ? "🎉 THE CELEBRATION IS LIVE TODAY!" : "✨ EVENT COUNTDOWN"}
      </div>
      <div className="countdown-grid">
        <div className="countdown-card">
          <span className="num">{String(timeLeft.days).padStart(2, "0")}</span>
          <span className="lbl">Days</span>
        </div>
        <span className="countdown-colon">:</span>
        <div className="countdown-card">
          <span className="num">{String(timeLeft.hours).padStart(2, "0")}</span>
          <span className="lbl">Hours</span>
        </div>
        <span className="countdown-colon">:</span>
        <div className="countdown-card">
          <span className="num">{String(timeLeft.minutes).padStart(2, "0")}</span>
          <span className="lbl">Minutes</span>
        </div>
        <span className="countdown-colon">:</span>
        <div className="countdown-card highlight-card">
          <span className="num">{String(timeLeft.seconds).padStart(2, "0")}</span>
          <span className="lbl">Seconds</span>
        </div>
      </div>
    </div>
  );
}
