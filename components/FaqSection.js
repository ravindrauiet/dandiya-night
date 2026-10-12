"use client";

import { useState } from "react";
import { FAQS } from "@/lib/event";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="section-faq">
      <div className="container">
        <div className="section-head">
          <div className="festive-badge">❓ GOT QUESTIONS?</div>
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about passes, entry, and the event</p>
        </div>

        <div className="faq-list">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`card faq-item ${isOpen ? "faq-open" : ""}`}
              >
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-title">{faq.q}</span>
                  <span className="faq-icon">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
