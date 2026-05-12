// src/components/ExplorePanel.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { UiContext } from "../contexts/UiContext";

/**
 * ExplorePanel (Luxury Edition)
 * 
 * - Close button pinned to the far right.
 * - Spacious padding to prevent overlap with top controls.
 * - Refined "Web Development" column spacing.
 * - Gold accents, smooth transitions, and glassmorphism.
 * - Fully accessible focus trap and keyboard navigation.
 */

export default function ExplorePanel() {
  const { exploreOpen, setExploreOpen } = useContext(UiContext);
  const panelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const [openColumn, setOpenColumn] = useState(null);

  // Manage body scroll and header visibility
  useEffect(() => {
    if (exploreOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("explore-open");
      const header = document.querySelector(".zeal-header");
      if (header) header.setAttribute("aria-hidden", "true");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("explore-open");
      const header = document.querySelector(".zeal-header");
      if (header) header.setAttribute("aria-hidden", "false");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("explore-open");
      const header = document.querySelector(".zeal-header");
      if (header) header.setAttribute("aria-hidden", "false");
    };
  }, [exploreOpen]);

  // Focus management on open
  useEffect(() => {
    if (!exploreOpen) return;
    previouslyFocusedRef.current = document.activeElement;
    const panel = panelRef.current;
    if (!panel) return;
    const t = setTimeout(() => {
      const focusable = panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (focusable.length) focusable[0].focus();
    }, 100);
    return () => clearTimeout(t);
  }, [exploreOpen]);

  // Focus restoration on close
  useEffect(() => {
    if (exploreOpen) return;
    const prev = previouslyFocusedRef.current;
    if (prev && typeof prev.focus === "function") {
      setTimeout(() => prev.focus(), 50);
    }
  }, [exploreOpen]);

  // Key handling (Escape & Tab trap)
  useEffect(() => {
    function onKey(e) {
      if (!exploreOpen) return;
      if (e.key === "Escape") {
        setOpenColumn(null);
        setExploreOpen(false);
        return;
      }
      if (e.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = Array.from(
          panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
        ).filter((el) => el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [exploreOpen, setExploreOpen]);

  // Click outside to close
  useEffect(() => {
    function onDocClick(e) {
      if (!exploreOpen) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpenColumn(null);
        setExploreOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [exploreOpen, setExploreOpen]);

  function toggleColumn(id) {
    setOpenColumn((prev) => (prev === id ? null : id));
  }

  function handleBack() {
    setOpenColumn(null);
    if (panelRef.current) {
      const header = panelRef.current.querySelector(".mega-toggle");
      if (header) header.focus();
    }
  }

  return (
    <div
      id="explorePanel"
      className={`explore-panel ${exploreOpen ? "open" : ""}`}
      aria-hidden={!exploreOpen}
      role="dialog"
      aria-label="Explore menu"
      aria-modal={exploreOpen ? "true" : "false"}
    >
      <div className="explore-backdrop" aria-hidden="true" onClick={() => { setOpenColumn(null); setExploreOpen(false); }} />

      <div className="explore-inner" role="document" ref={panelRef}>
        {/* Close Button - Pinned to Far Right */}
        <button
          id="exploreClose"
          className="explore-close"
          type="button"
          aria-label="Close explore menu"
          onClick={() => { setOpenColumn(null); setExploreOpen(false); }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Main Content Area */}
        <div id="megaMenu" className="mega-menu" role="menu" aria-hidden={!exploreOpen}>
          <div className="mega-inner">
            
            {/* Column 1: Web Development */}
            <MegaColumn
              id="col-web"
              title="Web Development"
              items={[
                "Business Page",
                "Landing Page",
                "Single HTML + CSS Page",
                "Ecommerce Store",
                "Headless CMS Integrations",
              ]}
              open={openColumn === "col-web"}
              onToggle={() => toggleColumn("col-web")}
            />

            {/* Column 2: UX / UI Design */}
            <MegaColumn
              id="col-ux"
              title="UX / UI Design"
              items={[
                "JavaScript",
                "React",
                "Vue",
                "CSS",
                "Design Systems",
                "Accessibility Audits",
                "Prototyping & Research",
              ]}
              open={openColumn === "col-ux"}
              onToggle={() => toggleColumn("col-ux")}
            />

            {/* Column 3: API Integration */}
            <MegaColumn
              id="col-api"
              title="API Integration"
              items={[
                "Handling Requests",
                "Third-party API Integrations",
                "Creating Endpoints",
                "Custom API solutions",
                "Security & Authentication",
                "Documentation & Testing",
                "RESTful API Development",
              ]}
              open={openColumn === "col-api"}
              onToggle={() => toggleColumn("col-api")}
            />

            {/* Column 4: Social Media */}
            <MegaColumn
              id="col-social"
              title="Social Media"
              items={[
                { type: "button", label: "Instagram", service: "instagram" },
                { type: "button", label: "Twitter", service: "twitter" },
                { type: "button", label: "Facebook", service: "facebook" },
                { type: "button", label: "YouTube", service: "youtube" },
                { type: "button", label: "TikTok", service: "tiktok" },
                { type: "button", label: "LinkedIn", service: "linkedin" },
                { type: "link", label: "Get Catalogue", href: "/assets/catalogue.pdf", className: "s-btn s-btn-primary" },
              ]}
              open={openColumn === "col-social"}
              onToggle={() => toggleColumn("col-social")}
            />

            {/* Column 5: Discover More */}
            <MegaColumn
              id="col-discover"
              title="Discover More"
              items={[
                "Image Editing Software",
                "Webmaster Tools",
                "Logo Design Services",
                "Domain Name Registration",
                "Video Editing Software",
                "Graphic Design Software",
                "DeepFaceLab & Realtime Face‑swap Tech",
              ]}
              open={openColumn === "col-discover"}
              onToggle={() => toggleColumn("col-discover")}
            />

            {/* Footer Controls - Spaced from content */}
            <div className="mega-footer-controls" aria-hidden={false}>
              <button
                id="exploreBackUnderServices"
                className="explore-back"
                type="button"
                hidden={openColumn === null}
                onClick={handleBack}
              >
                ← Back
              </button>

              <a
                id="downloadCatalogue"
                className="catalogue-link btn btn--secondary"
                href="/assets/catalogue.pdf"
                download="ZEAL-catalogue.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Full Catalogue (PDF)
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Panel Container */
        .explore-panel {
          position: fixed;
          inset: 0;
          z-index: 2100; /* Below header, above content */
          display: block;
          visibility: hidden;
          opacity: 0;
          transition: visibility 0.4s ease, opacity 0.4s ease;
          pointer-events: none;
        }
        .explore-panel.open {
          visibility: visible;
          opacity: 1;
          pointer-events: auto;
        }

        /* Backdrop */
        .explore-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(4, 5, 8, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: background 0.4s ease;
        }
        .explore-panel.open .explore-backdrop {
          background: rgba(4, 5, 8, 0.85);
        }

        /* Inner Panel Container */
        .explore-inner {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: min(100%, 1200px);
          max-width: 95%;
          background: linear-gradient(180deg, #0a0c14 0%, #040508 100%);
          border-left: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: -30px 0 80px rgba(0, 0, 0, 0.8);
          overflow-y: auto;
          overflow-x: hidden;
          transform: translateX(100%);
          transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          
          /* Spacing Logic */
          padding: 5rem 3rem 4rem 3rem; /* Top padding clears the close button */
        }
        .explore-panel.open .explore-inner {
          transform: translateX(0);
        }

        /* Close Button - Far Right */
        .explore-close {
          position: absolute;
          right: 2rem; /* Far right alignment */
          top: 2rem;   /* Top alignment */
          left: auto;  /* Reset any left positioning */
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 1.2rem;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s ease;
        }
        .explore-close:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #d4af37;
          color: #d4af37;
          transform: rotate(90deg);
        }

        /* Mega Menu Grid */
        .mega-menu {
          width: 100%;
        }

        .mega-inner {
          display: grid;
          /* Responsive columns with generous gaps */
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 3rem; /* Increased spacing between columns */
          align-items: start;
        }

        /* Column Styling */
        .mega-column {
          background: rgba(255, 255, 255, 0.015);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          transition: border-color 0.3s ease, background 0.3s ease;
        }
        .mega-column:hover {
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.025);
        }
        .mega-column[aria-expanded="true"] {
          border-color: rgba(212, 175, 55, 0.3);
          background: rgba(212, 175, 55, 0.02);
        }

        /* Column Toggle Header */
        .mega-toggle {
          margin: 0 0 1.25rem 0;
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: #fff;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: space-between;
          outline: none;
        }
        .mega-toggle:focus-visible {
          box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.5);
          border-radius: 4px;
        }
        .mega-toggle::after {
          content: "+";
          font-weight: 400;
          color: #888;
          transition: transform 0.3s ease;
        }
        .mega-column[aria-expanded="true"] .mega-toggle::after {
          content: "×";
          color: #d4af37;
          transform: rotate(90deg);
        }

        /* List Items */
        .mega-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.4s ease;
        }
        .mega-column[aria-expanded="true"] .mega-list {
          grid-template-rows: 1fr;
        }

        .mega-list > div {
          overflow: hidden;
        }

        .mega-list li {
          margin: 0.6rem 0;
          opacity: 0;
          transform: translateY(-8px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .mega-column[aria-expanded="true"] .mega-list li {
          opacity: 1;
          transform: translateY(0);
        }
        /* Staggered animation delays */
        .mega-column[aria-expanded="true"] .mega-list li:nth-child(1) { transition-delay: 0.05s; }
        .mega-column[aria-expanded="true"] .mega-list li:nth-child(2) { transition-delay: 0.1s; }
        .mega-column[aria-expanded="true"] .mega-list li:nth-child(3) { transition-delay: 0.15s; }
        .mega-column[aria-expanded="true"] .mega-list li:nth-child(4) { transition-delay: 0.2s; }
        .mega-column[aria-expanded="true"] .mega-list li:nth-child(5) { transition-delay: 0.25s; }
        .mega-column[aria-expanded="true"] .mega-list li:nth-child(6) { transition-delay: 0.3s; }
        .mega-column[aria-expanded="true"] .mega-list li:nth-child(7) { transition-delay: 0.35s; }

        .mega-list a,
        .mega-list button {
          color: #a1a7b8;
          text-decoration: none;
          background: transparent;
          border: none;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          display: block;
          width: 100%;
          text-align: left;
          font-size: 0.95rem;
          transition: color 0.2s ease, background 0.2s ease, transform 0.2s ease;
        }
        .mega-list a:hover,
        .mega-list button:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(4px);
        }
        .mega-list a:focus-visible,
        .mega-list button:focus-visible {
          outline: 2px solid #d4af37;
          outline-offset: 2px;
        }

        /* Footer Controls */
        .mega-footer-controls {
          grid-column: 1 / -1; /* Spans full width */
          margin-top: 4rem;    /* Spacing before next component/footer area */
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
        }

        .explore-back {
          background: transparent;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }
        .explore-back:hover {
          border-color: #d4af37;
          color: #d4af37;
          transform: translateX(-4px);
        }

        .catalogue-link {
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          background: rgba(212, 175, 55, 0.1);
          color: #d4af37;
          text-decoration: none;
          border: 1px solid rgba(212, 175, 55, 0.2);
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        .catalogue-link:hover {
          background: #d4af37;
          color: #040508;
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .explore-inner {
            width: 100%;
            max-width: 100%;
            border-left: none;
            padding: 6rem 1.5rem 3rem; /* More top padding on mobile */
          }
          .explore-close {
            right: 1rem;
            top: 1rem;
          }
          .mega-inner {
            grid-template-columns: 1fr; /* Stack columns on mobile */
            gap: 2rem;
          }
        }
      `}</style>
    </div>
  );
}

/* MegaColumn Sub-component */
function MegaColumn({ id, title, items, open, onToggle }) {
  function onKey(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  }

  return (
    <div className="mega-column" aria-expanded={open}>
      <h4
        className="mega-toggle"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        onKeyDown={onKey}
      >
        {title}
      </h4>

      <div id={id} className="mega-list" aria-hidden={!open} style={{ display: "grid" }}>
        <div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {items.map((it, i) => {
              const key = `${id}-item-${i}`;
              if (typeof it === "string") return (
                <li key={key}><a href="#">{it}</a></li>
              );
              if (it.type === "button") return (
                <li key={key}><button className="social-link" data-service={it.service} type="button">{it.label}</button></li>
              );
              return (
                <li key={key}><a className={it.className || ""} href={it.href}>{it.label}</a></li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
