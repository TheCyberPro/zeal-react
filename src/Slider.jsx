import React, { useRef, useState, useEffect, useCallback } from "react";

export default function Slider({ children, perPage = 3 }) {
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slideCount = React.Children.count(children);
  const maxIndex = Math.max(0, Math.ceil(slideCount / perPage) - 1);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Navigate to specific index
  const goToSlide = useCallback(
    (newIndex) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setIndex(Math.max(0, Math.min(maxIndex, newIndex)));
      setTimeout(() => setIsTransitioning(false), prefersReducedMotion ? 0 : 360);
    },
    [maxIndex, isTransitioning, prefersReducedMotion]
  );

  const prev = useCallback(() => goToSlide(index - 1), [index, goToSlide]);
  const next = useCallback(() => goToSlide(index + 1), [index, goToSlide]);

  // Update track position
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const slideWidth = 100 / slideCount;
    const offset = index * perPage * slideWidth;
    track.style.transform = `translateX(-${offset}%)`;
    track.style.transition = prefersReducedMotion ? "none" : "transform 0.36s cubic-bezier(0.22, 0.9, 0.3, 1)";
  }, [index, slideCount, perPage, prefersReducedMotion]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isFocusedInside = containerRef.current?.contains(document.activeElement);
      if (!isFocusedInside) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "Home") {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goToSlide(maxIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prev, next, goToSlide, maxIndex]);

  // Touch/swipe support
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          next();
        } else {
          prev();
        }
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [next, prev]);

  if (slideCount === 0) return null;

  return (
    <div
      ref={containerRef}
      className="services-slider"
      role="region"
      aria-roledescription="carousel"
      aria-label="Content carousel"
    >
      <button
        className="slider-btn"
        onClick={prev}
        aria-label="Previous slide"
        disabled={index === 0}
      >
        ‹
      </button>

      <div className="slider-track-wrap">
        <ul
          className="slider-track"
          ref={trackRef}
          role="list"
          aria-live={prefersReducedMotion ? "off" : "polite"}
          aria-atomic="true"
        >
          {React.Children.map(children, (child, i) => (
            <li
              className="slide"
              key={i}
              role="listitem"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} of ${slideCount}`}
              style={{ flex: `0 0 ${100 / slideCount}%` }}
            >
              {child}
            </li>
          ))}
        </ul>
      </div>

      <button
        className="slider-btn"
        onClick={next}
        aria-label="Next slide"
        disabled={index === maxIndex}
      >
        ›
      </button>

      <div className="slider-dots" role="tablist" aria-label="Slide navigation">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            className={`slider-dot ${i === index ? "active" : ""}`}
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to slide group ${i + 1}`}
            onClick={() => goToSlide(i)}
          />
        ))}
      </div>

      <style>{`
        .services-slider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: relative;
          width: 100%;
        }

        .slider-track-wrap {
          overflow: hidden;
          flex: 1 1 auto;
        }

        .slider-track {
          display: flex;
          gap: 1rem;
          padding: 0;
          margin: 0;
          list-style: none;
          will-change: transform;
        }

        .slide {
          display: flex;
        }

        .slider-btn {
          background: rgba(13, 5, 45, 0.9);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.6rem 0.8rem;
          border-radius: 8px;
          cursor: pointer;
          flex: 0 0 auto;
          font-size: 1.2rem;
          transition: all 0.2s ease;
        }

        .slider-btn:hover:not(:disabled) {
          background: rgba(13, 5, 45, 1);
          border-color: rgba(255, 213, 79, 0.3);
          transform: scale(1.05);
        }

        .slider-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .slider-btn:focus {
          outline: 3px solid rgba(255, 213, 79, 0.14);
          outline-offset: 3px;
        }

        .slider-dots {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          margin-top: 1rem;
          position: absolute;
          bottom: -2rem;
          left: 50%;
          transform: translateX(-50%);
        }

        .slider-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
          cursor: pointer;
          border: 0;
          padding: 0;
          transition: all 0.2s ease;
        }

        .slider-dot:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.2);
        }

        .slider-dot.active {
          background: var(--gold, #ffd54f);
          box-shadow: 0 6px 18px rgba(255, 213, 79, 0.12);
          transform: scale(1.2);
        }

        .slider-dot:focus {
          outline: 2px solid rgba(255, 213, 79, 0.5);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .slider-track,
          .slider-btn,
          .slider-dot {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
