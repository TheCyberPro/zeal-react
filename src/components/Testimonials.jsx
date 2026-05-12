import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_ITEMS = [
  { id: 1, quote: "ZEAL transformed our onboarding — conversion up 42%.", author: "Amina K., Founder" },
  { id: 2, quote: "Design and engineering that feel premium and fast.", author: "Chinedu O., Product Lead" },
  { id: 3, quote: "Reliable, secure, and beautifully executed.", author: "Lola M., Head of Growth" },
  { id: 4, quote: "Working with ZEAL transformed our launch — clear strategy, flawless execution, and results that speak for themselves.", author: "YM, CEO The Drip District" }
];

export default function Testimonials({ items = DEFAULT_ITEMS, interval = 6000 }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const track = useCallback((event, label) => {
    try { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event, label }); } catch (e) {}
  }, []);

  const navigate = useCallback((offset) => {
    setIndex((prevIndex) => {
      const len = items.length;
      return ((prevIndex + offset) % len + len) % len;
    });
  }, [items.length]);

  const next = useCallback(() => { navigate(1); track("testimonials_next"); }, [navigate, track]);
  const prev = useCallback(() => { navigate(-1); track("testimonials_prev"); }, [navigate, track]);

  // Autoplay
  useEffect(() => {
    if (paused || items.length <= 1) return;
    timerRef.current = setInterval(() => {
      navigate(1);
    }, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, interval, items.length, navigate]);

  // Hover/Focus pause
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onEnter = () => { setPaused(true); track("testimonials_pause"); };
    const onLeave = () => { setPaused(false); track("testimonials_resume"); };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("focusin", onEnter);
    el.addEventListener("focusout", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("focusin", onEnter);
      el.removeEventListener("focusout", onLeave);
    };
  }, [track]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") { prev(); }
      if (e.key === "ArrowRight") { next(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (!items || !items.length) return null;

  const currentItem = items[index];

  return (
    <section id="testimonials" className="zt-testimonials" aria-label="Client feedback" ref={containerRef}>
      <div className="zt-container">
        {/* Fixed height track to prevent layout shifts during mount/unmount */}
        <div className="zt-track">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={currentItem.id}
              className="zt-card"
              role="listitem"
              aria-roledescription="slide"
              aria-label={`Testimonial ${index + 1} of ${items.length}`}
              initial={{ opacity: 0, x: 50, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <svg className="zt-quote-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.687 4.145-4.243 5.192 0 .538.074.954.187 1.164.112.21.26.294.507.294.248 0 .396-.084.507-.294.112-.21.187-.626.187-1.164V12h3v5.321H7.583c-.565 0-.995-.158-1.24-.436-.245-.278-.37-.69-.37-1.164v-4.4zm10 0c-1.03-1.094-1.583-2.321-1.583-4.31 0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.687 4.145-4.243 5.192 0 .538.074.954.187 1.164.112.21.26.294.507.294.248 0 .396-.084.507-.294.112-.21.187-.626.187-1.164V12h3v5.321H17.583c-.565 0-.995-.158-1.24-.436-.245-.278-.37-.69-.37-1.164v-4.4z" />
              </svg>
              <p className="zt-text">"{currentItem.quote}"</p>
              <footer className="zt-author">— {currentItem.author}</footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <nav className="zt-nav">
          <button className="zt-btn zt-btn--arrow zt-btn--prev" aria-label="Previous testimonial" onClick={prev}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div className="zt-dots" role="tablist" aria-label="Testimonials navigation">
            {items.map((item, i) => (
              <button
                key={item.id}
                className={`zt-dot ${i === index ? "zt-dot--active" : ""}`}
                aria-label={`Show testimonial ${i + 1}`}
                aria-pressed={i === index}
                onClick={() => { setIndex(i); track("testimonials_dot", `dot_${i + 1}`); }}
              />
            ))}
          </div>

          <button className="zt-btn zt-btn--arrow zt-btn--next" aria-label="Next testimonial" onClick={next}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </nav>

        <span className={`zt-badge ${paused ? "zt-badge--visible" : ""}`} aria-live="polite">
          {paused ? "Paused" : ""}
        </span>
      </div>

      <style>{`
        /* Isolated Styles with zt- prefix */
        .zt-testimonials {
          position: relative;
          background: #040508;
          padding: clamp(4rem, 8vw, 6rem) 0;
          font-family: system-ui, -apple-system, 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          isolation: isolate;
        }

        .zt-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 1.5rem;
          position: relative;
          z-index: 1;
        }

        /* Track wrapper with min-height to reserve space for the card */
        .zt-track {
          position: relative;
          width: 100%;
          min-height: 300px;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Card Styling */
        .zt-card {
          width: 100%;
          max-width: 900px;
          text-align: center;
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          box-shadow: 0 20px 60px -20px rgba(0, 0, 0, 0.5);
          will-change: opacity, transform;
        }

        /* Icon */
        .zt-quote-icon {
          width: 44px;
          height: 44px;
          fill: rgba(212, 175, 55, 0.3);
          margin-bottom: 1.5rem;
        }

        /* Quote Text */
        .zt-text {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(1.25rem, 2.5vw, 1.7rem);
          line-height: 1.6;
          color: #e5e7eb;
          margin: 0 0 2rem;
          font-style: italic;
          font-weight: 400;
          letter-spacing: 0.01em;
          max-width: 800px;
          text-shadow: 0 0 15px rgba(245, 215, 110, 0.1), 0 0 30px rgba(212, 175, 55, 0.05);
        }

        /* Author Name */
        .zt-author {
          font-family: system-ui, sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: #d4af37;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          width: 100%;
          text-align: right;
          opacity: 0.9;
        }

        /* Navigation Controls */
        .zt-nav {
          display: flex;
          align-items: center;
          gap: 2rem;
          position: relative;
          z-index: 3;
        }

        .zt-btn { padding: 0; border: none; background: transparent; cursor: pointer; }

        .zt-btn--arrow {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .zt-btn--arrow:hover {
          background: rgba(212, 175, 55, 0.1);
          border-color: rgba(212, 175, 55, 0.5);
          color: #f5d76e;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px -6px rgba(212, 175, 55, 0.3);
        }
        .zt-btn--arrow:focus-visible {
          outline: 2px solid #f5d76e;
          outline-offset: 3px;
        }

        /* Dots */
        .zt-dots { display: flex; gap: 0.65rem; align-items: center; }
        .zt-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
        }
        .zt-dot:hover { background: rgba(255,255,255,0.5); transform: scale(1.2); }
        .zt-dot.zt-dot--active {
          background: #d4af37;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
          width: 20px;
          border-radius: 10px;
        }

        /* Pause Badge */
        .zt-badge {
          position: absolute;
          bottom: -32px;
          left: 50%;
          transform: translateX(-50%) translateY(5px);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.03);
          padding: 4px 10px;
          border-radius: 20px;
          opacity: 0;
          transition: all 0.3s ease;
          pointer-events: none;
        }
        .zt-badge.zt-badge--visible {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        @media (max-width: 768px) {
          .zt-track { min-height: 340px; }
          .zt-card { padding: 2rem 1.5rem; }
          .zt-text { font-size: 1.15rem; line-height: 1.5; }
          .zt-nav { gap: 1.25rem; margin-top: 1rem; }
          .zt-btn--arrow { width: 38px; height: 38px; }
        }
      `}</style>
    </section>
  );
}
