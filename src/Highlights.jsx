import React, { useState, useEffect, useRef } from "react";

const DEFAULT_ITEMS = [
  {
    id: "microservices",
    title: "Resilient Microservices",
    text: "Designed and shipped a microservices architecture with automated CI/CD, health checks, and zero-downtime deploys. Reduced incident recovery time by 72%.",
    icon: "cloud",
  },
  {
    id: "headless",
    title: "Headless Commerce",
    text: "Led a migration to a headless commerce stack with composable storefronts and payment orchestration. Achieved a 28% improvement in checkout conversion.",
    icon: "cart",
  },
  {
    id: "design-system",
    title: "Design System",
    text: "Created a production-ready design system with tokens, accessible components, and Figma-to-code pipelines. Cut new feature UI time by 35%.",
    icon: "palette",
  },
  {
    id: "performance",
    title: "Performance Wins",
    text: "Delivered Lighthouse improvements across core pages: LCP down 45%, TTFB improved by 60%, and Core Web Vitals scores consistently green.",
    icon: "bolt",
  },
  {
    id: "api",
    title: "API-First Integrations",
    text: "Built a robust API layer (REST + GraphQL) with strong observability and contract tests, enabling partner onboarding in under 2 weeks.",
    icon: "api",
  },
  {
    id: "growth",
    title: "Data-Driven Growth",
    text: "Established an experimentation framework and analytics instrumentation that surfaced high-impact funnel optimizations, increasing AOV.",
    icon: "chart",
  },
];

const ICONS = {
  cloud: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 19a5 5 0 01-10 0 7 7 0 0112.46-1.68A5 5 0 0112 19zm0 0a5 5 0 015-5 7 7 0 00.54-2.96 5 5 0 00-9.86 0 7 7 0 00-1.26 2.96"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  ),
  cart: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </g>
  ),
  palette: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.88-.13 2.8-.38a2.15 2.15 0 001.5-1.5c.32-.8.5-1.7.5-2.62 0-5.5-4.5-10-10-10z" />
      <circle cx="13.5" cy="6.5" r="1" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="1" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="1" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="1" fill="currentColor" />
    </g>
  ),
  bolt: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  ),
  api: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14a1 1 0 01-.78-1.63l9.9-10.2a.5.5 0 01.86.46l-1.92 6.02A1 1 0 0013 10h7a1 1 0 01.78 1.63l-9.9 10.2a.5.5 0 01-.86-.46l1.92-6.02A1 1 0 0011 14z" />
    </g>
  ),
  chart: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M7 16l4-8 4 4 5-9" />
    </g>
  ),
};

const CardIcon = ({ type }) => (
  <svg viewBox="0 0 24 24" className="card-icon">
    {ICONS[type] || ICONS.cloud}
  </svg>
);

export default function App() {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const items = DEFAULT_ITEMS;
  const count = items.length;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[activeIndex];
    if (!card) return;

    card.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || count <= 1 || isHovering) return;

    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 6000);

    return () => clearInterval(id);
  }, [count, prefersReducedMotion, isHovering]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isFocusedInside = document.activeElement?.closest('.highlights-container');
      if (!isFocusedInside) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(0, prev - 1));
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(count - 1, prev + 1));
      }
      if (e.key === "Home") {
        e.preventDefault();
        setActiveIndex(0);
      }
      if (e.key === "End") {
        e.preventDefault();
        setActiveIndex(count - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [count]);

  const handleCardEnter = (index) => {
    setActiveIndex(index);
    setIsHovering(true);
  };

  const handleCardLeave = () => {
    setIsHovering(false);
  };

  return (
    <div className="app-wrapper">
      <div
        className="highlights-container"
        role="region"
        aria-label="Developer highlights carousel"
      >
        <div
          className="highlights-track"
          role="list"
          aria-label="Highlights carousel track"
          ref={trackRef}
        >
          {items.map((item, i) => (
            <article
              key={item.id}
              className={`highlight-card ${i === activeIndex ? "active" : ""}`}
              role="listitem"
              tabIndex={0}
              aria-current={i === activeIndex ? "true" : "false"}
              onMouseEnter={() => handleCardEnter(i)}
              onMouseLeave={handleCardLeave}
              onFocus={() => setActiveIndex(i)}
            >
              <div className="card-header">
                <div className="card-icon-wrapper">
                  <CardIcon type={item.icon} />
                </div>
                <h3 className="card-title">{item.title}</h3>
              </div>
              <p className="card-text">{item.text}</p>
            </article>
          ))}
        </div>

        <div
          className="highlight-dots"
          role="tablist"
          aria-label="Highlight navigation"
        >
          {items.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === activeIndex ? "active" : ""}`}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              onMouseEnter={() => setActiveIndex(i)}
            />
          ))}
        </div>

        {!prefersReducedMotion && (
          <div className={`autoplay-status ${isHovering ? "paused" : ""}`}>
            <svg className="autoplay-icon" viewBox="0 0 24 24">
              {isHovering ? (
                <g fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </g>
              ) : (
                <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
              )}
            </svg>
            <span>{isHovering ? "Paused" : "Auto-playing"}</span>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .app-wrapper {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #0b0c10;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #d6d6db;
          padding: 1.5rem 1rem;
        }

        .highlights-container {
          max-width: 1200px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .highlights-track {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding: 0.5rem 0.5rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
          width: 100%;
        }

        .highlights-track::-webkit-scrollbar {
          height: 4px;
        }

        .highlights-track::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
        }

        .highlight-card {
          flex: 0 0 min(280px, 80%);
          height: auto;
          min-height: 120px;
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 1.25rem;
          scroll-snap-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1),
                      box-shadow 0.3s cubic-bezier(0.2, 0.9, 0.3, 1),
                      border-color 0.3s ease;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: visible; 
        }

        .highlight-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #c9a84c, transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .highlight-card.active::before,
        .highlight-card:hover::before {
          opacity: 1;
        }

        .highlight-card.active {
          border-color: rgba(201, 168, 76, 0.25);
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.3), 0 0 12px rgba(201,168,76,0.08);
        }

        .highlight-card:focus-visible {
          outline: 2px solid #c9a84c;
          outline-offset: 2px;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .card-icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(201, 168, 76, 0.08);
          border: 1px solid rgba(201, 168, 76, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-icon {
          width: 28px;
          height: 28px;
          color: #c9a84c;
        }

        .card-title {
          font-size: 1rem;
          font-weight: 500;
          color: #ffffff;
          line-height: 1.3;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .card-text {
          margin: 0;
          color: #9a9aa0;
          line-height: 1.6;
          font-size: 0.88rem;
          font-weight: 400;
          flex-grow: 1;
          overflow: visible;
        }

        .highlight-dots {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 0.25rem;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }

        .dot:hover {
          background: rgba(255,255,255,0.25);
          transform: scale(1.15);
        }

        .dot.active {
          background: linear-gradient(135deg, #c9a84c, #a8882e);
          box-shadow: 0 0 6px rgba(201, 168, 76, 0.3);
          transform: scale(1.2);
          width: 20px;
          border-radius: 4px;
        }

        .autoplay-status {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.3);
          margin-top: 0.15rem;
          transition: opacity 0.3s ease;
          font-weight: 400;
        }

        .autoplay-status.paused {
          color: rgba(255,255,255,0.4);
        }

        .autoplay-icon {
          width: 10px;
          height: 10px;
        }

        @media (min-width: 768px) {
          .highlight-card {
            flex: 0 0 320px;
            padding: 1.25rem;
          }
        }

        @media (max-width: 520px) {
          .app-wrapper {
            padding: 1rem 0.25rem;
          }
          .highlights-track {
            gap: 0.75rem;
            padding: 0.25rem;
          }
          .highlight-card {
            flex: 0 0 80%;
            padding: 1rem;
          }
          .card-title {
            font-size: 0.95rem;
          }
          .card-text {
            font-size: 0.84rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .highlight-card {
            transition: none !important;
            transform: none !important;
          }
          .dot {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
