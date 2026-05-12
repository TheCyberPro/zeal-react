import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SERVICES = [
  {
    id: "enterprise",
    title: "Enterprise Web Platforms",
    summary:
      "Architecting resilient, scalable platforms for mission-critical operations with enterprise SLAs.",
    details:
      "We design and build modular platforms with multi-tenant support, observability, and automated CI/CD pipelines. Each platform is engineered with fault tolerance, distributed tracing, and zero-downtime deployment strategies.",
    icon: "enterprise",
    image:
      "https://image.qwenlm.ai/public_source/d79ffea0-038f-4ed1-8528-d927c2490921/19b52d4e7-dfe0-452d-82d8-c25dd27a5696.png",
    tags: ["Microservices", "Cloud-Native", "SLA"],
  },
  {
    id: "ecommerce",
    title: "Ecommerce & Conversion",
    summary:
      "High-converting commerce experiences with headless architecture and fast checkout flows.",
    details:
      "From catalog modelling to payment orchestration and personalization, we optimize every step of the funnel to increase AOV and lifetime value.",
    icon: "ecommerce",
    image:
      "https://image.qwenlm.ai/public_source/d79ffea0-038f-4ed1-8528-d927c2490921/1033f9249-e463-4edd-8597-7139e827baef.png",
    tags: ["Headless", "Payments", "AOV"],
  },
  {
    id: "design",
    title: "UX, UI & Design Systems",
    summary:
      "Design systems that scale: accessible, consistent, and delightful interfaces.",
    details:
      "We create component libraries, token systems, and documentation that empower product teams to ship faster while preserving brand integrity.",
    icon: "design",
    image:
      "https://image.qwenlm.ai/public_source/d79ffea0-038f-4ed1-8528-d927c2490921/18a8423c7-e9b4-464f-876b-8c4547cc60d4.png",
    tags: ["Design Tokens", "Components", "a11y"],
  },
  {
    id: "api",
    title: "API Strategy & Integrations",
    summary:
      "Secure, developer-friendly APIs and integrations that unlock ecosystem value.",
    details:
      "We design RESTful and GraphQL APIs, implement robust auth, and integrate third-party services with observability and test coverage.",
    icon: "api",
    image:
      "https://image.qwenlm.ai/public_source/d79ffea0-038f-4ed1-8528-d927c2490921/1ba1d9188-5382-4f30-9f44-8c0eac2f75fc.png",
    tags: ["REST", "GraphQL", "OAuth"],
  },
  {
    id: "performance",
    title: "Performance Engineering",
    summary:
      "Speed-first engineering: Lighthouse-grade performance, caching, and edge delivery.",
    details:
      "We optimize critical rendering paths, implement smart caching strategies, and tune infrastructure for consistent, fast experiences worldwide.",
    icon: "performance",
    image:
      "https://image.qwenlm.ai/public_source/d79ffea0-038f-4ed1-8528-d927c2490921/1a1a14102-1abf-406d-83f8-d40786c5ba16.png",
    tags: ["Lighthouse", "CDN", "Edge"],
  },
  {
    id: "security",
    title: "Security & Compliance",
    summary:
      "Security by design with compliance readiness for regulated industries.",
    details:
      "Threat modelling, secure architecture reviews, and automated testing to reduce risk and meet regulatory requirements.",
    icon: "security",
    image:
      "https://image.qwenlm.ai/public_source/d79ffea0-038f-4ed1-8528-d927c2490921/1770101e8-a401-4acd-a14e-9173f1c0a3f1.png",
    tags: ["SOC 2", "GDPR", "WAF"],
  },
  {
    id: "growth",
    title: "Growth, Analytics & CRO",
    summary:
      "Data-driven growth programs: experimentation, analytics, and conversion optimization.",
    details:
      "We instrument analytics, run rigorous A/B programs, and translate insights into product and marketing wins.",
    icon: "growth",
    image:
      "https://image.qwenlm.ai/public_source/d79ffea0-038f-4ed1-8528-d927c2490921/1e4176408-8c6d-42ea-8646-7e3fd4c0e17b.png",
    tags: ["A/B Testing", "Analytics", "CRO"],
  },
];

const ICONS = {
  enterprise: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 44V20L24 4L40 20V44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 44V32H30V44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 28H30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M14 44H34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  ecommerce: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6H10L14 22H38L42 10H14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="36" r="3" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="32" cy="36" r="3" stroke="currentColor" strokeWidth="2.5" />
      <path d="M8 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  design: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
      <path d="M24 6C24 6 24 24 24 24C24 24 6 24 6 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 6C24 6 42 24 42 24C42 24 24 24 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 42C24 42 6 24 6 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  api: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="24" r="6" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="36" cy="12" r="6" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="36" cy="36" r="6" stroke="currentColor" strokeWidth="2.5" />
      <path d="M17 21L31 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M17 27L31 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 18V30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.5" />
    </svg>
  ),
  performance: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 42L18 18L28 28L42 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 6H42V16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 18L42 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />
    </svg>
  ),
  security: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4L6 12V24C6 36 14 44 24 44C34 44 42 36 42 24V12L24 4Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 20V28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 32V34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="20" r="2" fill="currentColor" />
    </svg>
  ),
  growth: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 42L6 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 42H42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 32L16 22L24 28L42 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 10H42V18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="22" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="24" cy="28" r="2" fill="currentColor" opacity="0.5" />
    </svg>
  ),
};

const AMBIENT_COLORS = [
  { from: "#c9a84c", to: "#8b6914" },
  { from: "#4ca8c9", to: "#146b8b" },
  { from: "#c94ca8", to: "#8b146b" },
  { from: "#a8c94c", to: "#6b8b14" },
  { from: "#c9704c", to: "#8b4414" },
  { from: "#4cc970", to: "#148b44" },
  { from: "#704cc9", to: "#44148b" },
];

function ServiceIcon({ name, className = "" }) {
  return <div className={className}>{ICONS[name] || ICONS.enterprise}</div>;
}

function ServiceCard({ service, index, isActive, onClick, isExpanded, ambientColor, isInView }) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  return (
    <motion.article
      ref={cardRef}
      className="service-card"
      data-service-id={service.id}
      tabIndex={0}
      aria-labelledby={`svc-${service.id}-title`}
      aria-current={isActive ? "true" : "false"}
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ 
        opacity: isInView ? 1 : 0.7, 
        y: isInView ? 0 : 40, 
        scale: isActive ? 1.02 : isInView ? 1 : 0.96 
      }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onClick={() => onClick(index)}
      onFocus={() => onClick(index)}
    >
      <div
        className="card-glow"
        style={{
          background: `radial-gradient(500px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${ambientColor.from}12, transparent 60%)`,
        }}
      />

      {isActive && (
        <motion.div
          className="card-active-border"
          layoutId="active-border"
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: `linear-gradient(135deg, ${ambientColor.from}35, ${ambientColor.to}15)`,
          }}
        />
      )}

      <div className="card-inner">
        <div className="card-top-row">
          <div className="icon-wrapper" style={{ color: ambientColor.from }}>
            <ServiceIcon name={service.icon} />
          </div>
          <div className="card-number" style={{ color: ambientColor.from }}>
            {String(index + 1).padStart(2, "0")}
          </div>
        </div>

        <div className="card-content">
          <h3 id={`svc-${service.id}-title`} className="card-title" tabIndex={-1} style={isActive ? { color: "#fff" } : {}}>
            {service.title}
          </h3>

          <p className="card-summary">{service.summary}</p>

          <div className="card-tags">
            {service.tags.map((tag) => (
              <span key={tag} className="tag" style={{ borderColor: `${ambientColor.from}30`, color: `${ambientColor.from}bb` }}>
                {tag}
              </span>
            ))}
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                className="card-details-wrapper"
              >
                <p className="card-details">{service.details}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {service.image && (
            <motion.div className="card-image-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28, duration: 0.6 }}>
              <img className="card-image" src={service.image} alt="" loading="lazy" aria-hidden="true" />
              <div className="card-image-overlay" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function DotsNav({ services, activeIndex, onNavigate, ambientColor }) {
  return (
    <nav className="dots-nav" aria-label="Services navigation" role="navigation">
      <div className="dots-track">
        <motion.div 
          className="dots-fill" 
          style={{ 
            width: `${((activeIndex + 1) / services.length) * 100}%`,
            background: `linear-gradient(90deg, ${ambientColor.from}, ${ambientColor.to})`
          }} 
        />
        {services.map((s, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={s.id}
              className={`nav-dot ${isActive ? "active" : ""}`}
              aria-label={`${s.title} — ${idx + 1} of ${services.length}`}
              aria-pressed={isActive}
              onClick={() => onNavigate(idx)}
              onMouseEnter={() => onNavigate(idx)}
            >
              <span className="nav-dot-ring" />
              <span className="nav-dot-core" style={{ backgroundColor: isActive ? ambientColor.from : "transparent" }} />
            </button>
          );
        })}
      </div>

      <div className="dots-counter" aria-hidden="true">
        <span className="dots-current">{activeIndex + 1}</span>
        <span className="dots-sep">/</span>
        <span className="dots-total">{services.length}</span>
      </div>
    </nav>
  );
}

function FloatingOrbs({ ambientColor }) {
  return (
    <div className="ambient-orbs" aria-hidden="true">
      <motion.div 
        className="orb" 
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }} 
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} 
        style={{ 
          top: "10%", 
          left: "15%", 
          width: 300, 
          height: 300, 
          background: `radial-gradient(circle, ${ambientColor.from}, transparent 70%)`,
          opacity: 0.04 
        }} 
      />
      <motion.div 
        className="orb" 
        animate={{ x: [0, -40, 20, 0], y: [0, 50, -30, 0], scale: [1, 0.9, 1.15, 1] }} 
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} 
        style={{ 
          top: "50%", 
          right: "10%", 
          width: 400, 
          height: 400, 
          background: `radial-gradient(circle, ${ambientColor.to}, transparent 70%)`,
          opacity: 0.03 
        }} 
      />
    </div>
  );
}

export default function ServicesSlider({ services = SERVICES }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ambientColor = AMBIENT_COLORS[active] || AMBIENT_COLORS[0];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[active];
    if (!card) return;

    card.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [active, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || services.length <= 1 || isHovering) return;

    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % services.length);
    }, 7000);

    return () => clearInterval(id);
  }, [services.length, prefersReducedMotion, isHovering]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isFocusedInside = document.activeElement?.closest('.services-carousel-container');
      if (!isFocusedInside) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActive((prev) => Math.max(0, prev - 1));
        setExpanded(null);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActive((prev) => Math.min(services.length - 1, prev + 1));
        setExpanded(null);
      }
      if (e.key === "Home") {
        e.preventDefault();
        setActive(0);
        setExpanded(null);
      }
      if (e.key === "End") {
        e.preventDefault();
        setActive(services.length - 1);
        setExpanded(null);
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setExpanded((prev) => (prev === active ? null : active));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, services.length]);

  const handleCardClick = useCallback((idx) => {
    setActive(idx);
    setExpanded((prev) => (prev === idx ? null : idx));
  }, []);

  const handleNavClick = useCallback((idx) => {
    setActive(idx);
    setExpanded(null);
  }, []);

  const handleCardEnter = useCallback((idx) => {
    setActive(idx);
    setIsHovering(true);
  }, []);

  const handleCardLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  return (
    <section className="services-carousel-container" aria-labelledby="services-showcase-title">
      <style>{`
@import url("https://cdn.fontsource.fyi/fonts/inter/400,500,600,700,800.css");

.services-carousel-container {
  position: relative;
  background: #07060a;
  color: #f6f5f7;
  padding: 3rem 1.5rem;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.services-showcase-title {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px,1px,1px,1px);
  white-space: nowrap;
  border: 0;
  padding: 0;
  margin: -1px;
}

.ambient-orbs { 
  position: absolute; 
  inset: 0; 
  pointer-events: none; 
  z-index: 0; 
  overflow: hidden; 
}
.orb { 
  position: absolute; 
  border-radius: 50%; 
  filter: blur(100px); 
}

.services-carousel-inner {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
}

.services-track {
  display: flex;
  gap: 1.25rem;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding: 1rem 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.08) transparent;
  width: 100%;
  scroll-behavior: smooth;
}

.services-track::-webkit-scrollbar {
  height: 4px;
}
.services-track::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
}

.service-card {
  flex: 0 0 min(360px, 85%);
  min-height: 200px;
  max-height: 400px;
  position: relative;
  background: rgba(255,255,255,0.015);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  scroll-snap-align: center;
}
.service-card:hover {
  border-color: rgba(255,255,255,0.08);
}
.service-card:focus-visible {
  outline: 2px solid #c9a84c;
  outline-offset: 2px;
}
.service-card.active-card {
  border-color: rgba(255,255,255,0.12);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 24px rgba(201,168,76,0.06);
}

.card-glow { position: absolute; inset: 0; pointer-events: none; z-index: 0; border-radius: 16px; }
.card-active-border { 
  position: absolute; 
  inset: -1px; 
  border-radius: 17px; 
  z-index: 1; 
  pointer-events: none; 
  padding: 1px; 
}

.card-inner { position: relative; z-index: 2; padding: 1.5rem; }
.card-top-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.icon-wrapper { 
  width: 44px; 
  height: 44px; 
  border-radius: 12px; 
  background: rgba(255,255,255,0.03); 
  border: 1px solid rgba(255,255,255,0.06); 
  display:flex; 
  align-items:center; 
  justify-content:center; 
  flex-shrink:0; 
}
.icon-wrapper svg { width: 24px; height: 24px; }
.card-number { font-size: 0.8rem; font-weight:700; font-variant-numeric: tabular-nums; letter-spacing:0.05em; opacity:0.4; }

.card-title { 
  font-size: 1.15rem; 
  font-weight:700; 
  color: #d8d8e0; 
  margin:0 0 0.6rem; 
  letter-spacing:-0.01em; 
  line-height:1.3; 
  outline:none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-summary { color:#b0b0b8; margin:0 0 0.85rem; font-size:0.88rem; line-height:1.55; }
.card-tags { display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.85rem; }
.tag { font-size:0.7rem; font-weight:600; padding:0.25rem 0.6rem; border-radius:6px; border:1px solid; letter-spacing:0.03em; text-transform:uppercase; }

.card-details-wrapper { overflow:hidden; }
.card-details { color:#8a8a96; line-height:1.65; font-size:0.85rem; margin:0; padding-top:0.6rem; border-top:1px solid rgba(255,255,255,0.04); }

.card-image-wrapper { position:relative; margin-top:1rem; border-radius:10px; overflow:hidden; aspect-ratio:16/9; }
.card-image { width:100%; height:100%; object-fit:cover; display:block; }
.card-image-overlay { position:absolute; inset:0; background: linear-gradient(180deg, transparent 50%, rgba(7,6,10,0.7) 100%); }

/* Navigation dots */
.dots-nav { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 0.75rem;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}
.dots-track { 
  position: relative;
  display: flex; 
  align-items: center; 
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0;
}
.dots-fill {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  background: rgba(255,255,255,0.06);
  border-radius: 1px;
  transition: width 0.4s ease, background 0.4s ease;
}
.nav-dot { 
  position: relative;
  width: 28px; 
  height: 28px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: transparent; 
  border: none; 
  cursor: pointer; 
  padding: 0; 
  z-index: 2; 
  flex-shrink: 0;
}
.nav-dot-ring { 
  position: absolute; 
  width: 10px; 
  height: 10px; 
  border-radius: 50%; 
  border: 1.5px solid rgba(255,255,255,0.12); 
  transition: all 0.3s ease; 
}
.nav-dot-core { 
  position: absolute; 
  width: 5px; 
  height: 5px; 
  border-radius: 50%; 
  transition: all 0.3s ease; 
}
.nav-dot:hover .nav-dot-ring { 
  border-color: rgba(255,255,255,0.25); 
  transform: scale(1.15); 
}
.nav-dot.active .nav-dot-ring { 
  border-color: transparent; 
  transform: scale(1.6); 
}
.nav-dot.active .nav-dot-core { 
  width: 6px; 
  height: 6px; 
}
.dots-counter { 
  display: flex; 
  align-items: center; 
  gap: 3px; 
  font-size: 0.7rem; 
  font-weight: 600; 
  color: rgba(255,255,255,0.2); 
  font-variant-numeric: tabular-nums; 
}
.dots-current { color: rgba(255,255,255,0.5); font-size: 0.8rem; }

@media (max-width: 768px) {
  .services-carousel-container { padding: 2.5rem 1rem; }
  .service-card { flex: 0 0 min(300px, 85%); min-height: 180px; }
  .card-inner { padding: 1.25rem; }
  .card-title { font-size: 1.05rem; }
  .dots-track { gap: 0.4rem; }
  .nav-dot { width: 24px; height: 24px; }
  .nav-dot-ring { width: 8px; height: 8px; }
}

@media (max-width: 480px) {
  .services-carousel-container { padding: 2rem 0.5rem; }
  .service-card { flex: 0 0 82%; min-height: 160px; padding: 0; }
  .card-inner { padding: 1rem; }
  .card-title { font-size: 0.95rem; }
  .card-summary { font-size: 0.82rem; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { 
    animation-duration: 0.01ms !important; 
    transition-duration: 0.01ms !important; 
    scroll-behavior: auto !important;
  }
  .services-track { scroll-behavior: auto; }
}
      `}</style>

      <h2 id="services-showcase-title" className="services-showcase-title">Services Showcase</h2>

      <FloatingOrbs ambientColor={ambientColor} />

      <div className="services-carousel-inner">
        <div
          className="services-track"
          role="list"
          aria-label="Services carousel track"
          ref={trackRef}
        >
          {services.map((s, idx) => {
            const cardAmbient = AMBIENT_COLORS[idx % AMBIENT_COLORS.length];
            const isActive = idx === active;
            const isExpanded = expanded === idx;
            return (
              <ServiceCard
                key={s.id}
                service={s}
                index={idx}
                isActive={isActive}
                onClick={handleCardClick}
                isExpanded={isExpanded}
                ambientColor={cardAmbient}
                isInView={true}
              />
            );
          })}
        </div>

        <DotsNav 
          services={services} 
          activeIndex={active} 
          onNavigate={handleNavClick} 
          ambientColor={ambientColor} 
        />

        {!prefersReducedMotion && (
          <div className={`autoplay-status ${isHovering ? "paused" : ""}`}>
            <svg className="autoplay-icon" viewBox="0 0 24 24" width="10" height="10">
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
    </section>
  );
}
