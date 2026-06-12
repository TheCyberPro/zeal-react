import React, { useState, useEffect, useRef, useCallback } from "react";

const bgImageUrl =
  "https://image.qwenlm.ai/public_source/adcaf59d-9e00-4ca3-a24a-b314347af840/10620a55c-87a0-4bfa-969a-947c37986454.png";

const HERO_IMAGES = [bgImageUrl, bgImageUrl];

const TRUST_ITEMS = [
  { icon: "★", text: "Trusted by 200+ startups & enterprises" },
  { icon: "🔒", text: "Fast delivery, secure by design" },
  { icon: "♿", text: "Design systems & WCAG accessibility" },
  { icon: "📈", text: "Average 3x conversion improvement" },
];

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgReady, setBgReady] = useState(false);
  const [activeTrust, setActiveTrust] = useState(null);

  const mousePos = useRef({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const bgImgRef = useRef(null);
  const meshGlowRef = useRef(null);

  // Initialize loaded state
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Optimized mouse tracking (direct DOM updates to avoid 60fps re-renders)
  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mousePos.current = { x, y };

    if (bgImgRef.current) {
      bgImgRef.current.style.transform = `scale(1.08) translate(${x * -15}px, ${y * -10}px)`;
    }
    if (meshGlowRef.current) {
      meshGlowRef.current.style.top = `${50 + y * 30}%`;
      meshGlowRef.current.style.left = `${50 + x * 40}%`;
    }
    if (canvasRef.current) {
      canvasRef.current.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
    }
  }, []);






    // Do not auto-scroll on page load.
    // Replace direct scroll calls with a safe helper that only scrolls when:
    //  - the element has data-allow-scroll="true", or
    //  - a developer enables window.__ALLOW_SCROLL in the console for debugging,
    //  - or you explicitly call safeScrollToId from a user interaction (click).
    function safeScrollToId(id) {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.dataset.allowScroll === 'true' || window.__ALLOW_SCROLL) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Example: call safeScrollToId('work') from a click handler instead of auto-running here.
    // If you want to preserve hash navigation without auto-scrolling, uncomment:
    // if (location.hash === '#work') safeScrollToId('work');











  // Canvas flame/particle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero || typeof window === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    let dpr = Math.max(1, window.devicePixelRatio || 1);
    let w = 0, h = 0;
    let raf = null;
    let running = true;
    const particles = [];

    const MAX_PARTICLES = 100;
    const SPAWN_CHANCE = 0.6;
    const SPAWN_PER_FRAME = 3;
    const BASE_SIZE = 18;
    const COLORS = [
      { r: 201, g: 168, b: 76 },
      { r: 147, g: 120, b: 200 },
      { r: 255, g: 120, b: 90 },
      { r: 120, g: 200, b: 255 },
    ];

    function resize() {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      w = Math.max(300, rect.width || window.innerWidth);
      h = Math.max(300, rect.height || window.innerHeight);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function spawn() {
      if (particles.length >= MAX_PARTICLES) return;
      for (let i = 0; i < SPAWN_PER_FRAME; i++) {
        if (Math.random() > SPAWN_CHANCE) continue;
        particles.push({
          x: rand(w * 0.08, w * 0.92),
          y: h + BASE_SIZE * rand(0.5, 1.6),
          vx: rand(-18, 18),
          vy: rand(-120, -40),
          size: BASE_SIZE * rand(0.6, 2.2),
          life: rand(2.6, 5.2),
          age: 0,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          spin: rand(-1.2, 1.2),
          alpha: rand(0.6, 0.95),
        });
      }
    }

    function drawParticle(p) {
      const t = p.age / p.life;
      const alpha = Math.max(0, p.alpha * (1 - t));
      const scale = 1 + t * 0.6;
      const size = p.size * scale;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 1.6);
      const c = p.color;
      grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${alpha})`);
      grad.addColorStop(0.35, `rgba(${Math.min(255, c.r + 30)},${Math.min(255, c.g + 20)},${Math.min(255, c.b + 10)},${alpha * 0.6})`);
      grad.addColorStop(0.75, `rgba(${c.r},${c.g},${c.b},${alpha * 0.18})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin * t);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    let last = performance.now();
    function step(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!running) {
        raf = requestAnimationFrame(step);
        return;
      }

      spawn();
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(6,6,8,0.06)";
      ctx.fillRect(0, 0, w, h);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += dt;
        if (p.age >= p.life) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.995;
        p.vy += 18 * dt;
        drawParticle(p);
      }
      raf = requestAnimationFrame(step);
    }

    const resizeObserver = new ResizeObserver(() => resize());
    const io = new IntersectionObserver(
      ([entry]) => { running = entry.isIntersecting; },
      { threshold: 0.2 }
    );

    resize();
    resizeObserver.observe(hero);
    io.observe(hero);
    raf = requestAnimationFrame(step);

    return () => {
      resizeObserver.disconnect();
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Dynamic scroll-margin for #services
  useEffect(() => {
    const updateOffset = () => {
      const header = document.querySelector(".zeal-header");
      const services = document.getElementById("services");
      if (!services) return;
      const h = header ? header.getBoundingClientRect().height : 0;
      services.style.scrollMarginTop = `${Math.round(h + 20)}px`;
    };
    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/400.css');
        @import url('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/500.css');
        @import url('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/600.css');
        @import url('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/700.css');

        /* Scoped variables to avoid global conflicts with styles.css */
        .zeal-hero {
          --hero-primary: #c9a84c;
          --hero-primary-glow: rgba(201,168,76,0.25);
          --hero-primary-bright: #f5d76e;
          --hero-bg-dark: #0a0a0f;
          --hero-bg-card: rgba(255,255,255,0.03);
          --hero-border: rgba(255,255,255,0.08);
          --hero-border-hover: rgba(255,255,255,0.15);
          --hero-text: #f5f5f7;
          --hero-text-muted: #8a8a9a;
          
          position: relative;
          min-height: 125vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: var(--hero-text);
        }

        .zeal-hero * { box-sizing: border-box; }
        
        .hero-media { position: absolute; inset: 0; z-index: 0; }
        .hero-media__img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease-out; will-change: transform; filter: saturate(0.96) contrast(0.98); }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(10,10,15,0.92) 0%, rgba(10,10,15,0.75) 40%, rgba(10,10,15,0.6) 100%); z-index: 1; }

        .hero-flame-canvas { position: absolute; inset: 0; z-index: 2; pointer-events: none; width: 100%; height: 100%; }
        .hero-mesh-glow { position: absolute; width: 600px; height: 600px; border-radius: 50%; pointer-events: none; z-index: 2; transition: top 0.3s ease-out, left 0.3s ease-out; filter: blur(60px); }
        .hero-floating-orb { position: absolute; border-radius: 50%; pointer-events: none; z-index: 1; }
        .orb-1 { width: 300px; height: 300px; top: 10%; right: 5%; background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%); animation: hero-float-orb 8s ease-in-out infinite; }
        .orb-2 { width: 200px; height: 200px; bottom: 20%; right: 15%; background: radial-gradient(circle, rgba(147,120,200,0.06) 0%, transparent 70%); animation: hero-float-orb 10s ease-in-out infinite reverse; }
        @keyframes hero-float-orb { 0%,100%{transform:translate(0,0);}33%{transform:translate(20px,-30px);}66%{transform:translate(-10px,15px);} }

        .hero-body {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 8rem 2rem 14rem;
        }
        .hero-inner { max-width: 780px; margin-left: 0; }

        .hero-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.45rem 1rem; border-radius: 100px; background: var(--hero-bg-card); border: 1px solid var(--hero-border); font-size: 0.8rem; font-weight: 500; color: var(--hero-primary); letter-spacing: 0.06em; text-transform: uppercase; backdrop-filter: blur(12px); margin-bottom: 2rem; }
        .hero-badge__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--hero-primary); animation: hero-pulse-dot 2s ease-in-out infinite; }
        @keyframes hero-pulse-dot { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.8);} }

        .hero-heading { font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 700; line-height: 1.08; letter-spacing: -0.03em; margin-bottom: 1.5rem; background: linear-gradient(135deg, #ffffff 0%, #c9a84c 50%, #ffffff 100%); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: hero-shimmer-text 6s ease-in-out infinite; }
        @keyframes hero-shimmer-text { 0%,100%{background-position:0% center;}50%{background-position:200% center;} }

        .hero-lead { font-size: clamp(1.05rem, 2vw, 1.25rem); line-height: 1.7; color: var(--hero-text-muted); max-width: 600px; margin-bottom: 2.5rem; }
        
        /* LUXURY BUTTON SYSTEM */
        .hero-actions { display: flex; flex-wrap: wrap; gap: 1.25rem; margin-bottom: 3.5rem; align-items: center; }

        .hero-btn {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          cursor: pointer;
          border: none;
          padding: 0;
          background: transparent;
          transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.2, 1), filter 0.3s ease;
        }

        .hero-btn-label {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 24px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.02em;
          line-height: 1;
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.2, 1);
          position: relative;
          z-index: 2;
          white-space: nowrap;
        }

        .hero-btn-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          margin-left: 8px;
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.2, 1);
          position: relative;
          z-index: 2;
          flex-shrink: 0;
        }

        /* Primary Style */
        .hero-btn-primary .hero-btn-label {
          background: linear-gradient(145deg, #fff7d6 0%, #f5d76e 45%, #c9a84c 100%);
          color: #0b0b0b;
          box-shadow: 0 8px 24px rgba(201,168,76,0.25), 0 2px 4px rgba(255,255,255,0.3) inset, 0 -1px 2px rgba(0,0,0,0.1) inset;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .hero-btn-primary .hero-btn-arrow {
          background: linear-gradient(145deg, #e6c86e, #c9a84c);
          color: #0b0b0b;
          box-shadow: 0 6px 16px rgba(201,168,76,0.2);
        }
        .hero-btn-primary:hover .hero-btn-label { transform: translateY(-3px) scale(1.02); box-shadow: 0 16px 32px rgba(201,168,76,0.35), 0 2px 4px rgba(255,255,255,0.4) inset; }
        .hero-btn-primary:hover .hero-btn-arrow { transform: translateY(-3px) translateX(4px); background: #d4af37; }

        /* Ghost Style */
        .hero-btn-ghost .hero-btn-label {
          background: rgba(255, 255, 255, 0.02);
          color: #fff;
          border: 1px solid var(--hero-border);
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .hero-btn-ghost .hero-btn-arrow {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          border: 1px solid var(--hero-border);
          backdrop-filter: blur(8px);
        }
        .hero-btn-ghost:hover .hero-btn-label { background: rgba(255, 255, 255, 0.06); border-color: rgba(255,255,255,0.2); transform: translateY(-3px) scale(1.02); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .hero-btn-ghost:hover .hero-btn-arrow { transform: translateY(-3px) translateX(4px); background: rgba(201, 168, 76, 0.15); border-color: rgba(201, 168, 76, 0.4); color: #f5d76e; }

        /* Hover Rings */
        .hero-btn::before {
          content: ""; position: absolute; inset: -4px; border-radius: 999px; background: transparent; border: 1px solid transparent;
          opacity: 0; transition: all 0.4s cubic-bezier(0.25, 0.8, 0.2, 1); z-index: 1; pointer-events: none;
        }
        .hero-btn-primary::before { box-shadow: 0 0 30px 4px rgba(201,168,76,0.1); }
        .hero-btn-primary:hover::before { opacity: 1; inset: -8px; }
        .hero-btn-ghost::before { border-color: rgba(255,255,255,0.1); }
        .hero-btn-ghost:hover::before { opacity: 1; inset: -6px; border-color: rgba(255,255,255,0.2); }

        .hero-btn:focus-visible { outline: none; }
        .hero-btn:focus-visible .hero-btn-label { box-shadow: 0 0 0 4px rgba(201,168,76,0.3); }

        .hero-trust { list-style: none; display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem; margin-top: 0.75rem; }
        .hero-trust__item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--hero-text-muted); padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.3s; cursor: default; background: var(--hero-bg-card); border: 1px solid transparent; }
        .hero-trust__item:hover, .hero-trust__item.active { background: rgba(201,168,76,0.08); border-color: var(--hero-border); color: var(--hero-text); transform: translateY(-1px); }
        .hero-trust__item.trust-highlight { padding-bottom: 1.2rem; margin-bottom: 0.6rem; }

        /* Scroll Indicator - Explicitly defined to prevent conflicts */
        .hero-scroll-wrap {
          position: absolute;
          bottom: 2.5rem;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          z-index: 4;
          pointer-events: none;
        }
        .hero-scroll-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--hero-text-muted);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0.95;
          cursor: pointer;
          pointer-events: auto;
          transition: color 0.3s ease;
        }
        .hero-scroll-indicator:hover { color: var(--hero-primary); opacity: 1; }

        .hero-scroll-indicator__mouse { 
          width: 24px; 
          height: 38px; 
          border: 2px solid var(--hero-border); 
          border-radius: 12px; 
          position: relative; 
        }
        .hero-scroll-indicator__wheel { 
          position: absolute; 
          top: 6px; 
          left: 50%; 
          transform: translateX(-50%); 
          width: 3px; 
          height: 8px; 
          border-radius: 2px; 
          background: var(--hero-primary); 
          animation: hero-scroll-wheel 1.8s ease-in-out infinite; 
        }
        @keyframes hero-scroll-wheel { 
          0% { opacity: 1; transform: translateX(-50%) translateY(0); } 
          100% { opacity: 0; transform: translateX(-50%) translateY(14px); } 
        }

        .hero-divider { position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--hero-border) 20%, var(--hero-primary) 50%, var(--hero-border) 80%, transparent); opacity: 0.5; pointer-events: none; }

        @media (max-width: 768px) {
          .hero-body { padding: 6rem 1.5rem 12rem; }
          .hero-heading { font-size: clamp(2rem, 8vw, 2.8rem); }
          .hero-actions { flex-direction: column; align-items: stretch; }
          .hero-btn { justify-content: center; width: 100%; }
          .hero-btn-label { padding: 14px 20px; width: 100%; }
          .hero-btn-arrow { display: none; }
          .hero-trust { flex-direction: column; gap: 0.5rem; }
          .hero-flame-canvas { display: none; }
        }
      `}</style>

      <section
        className="zeal-hero"
        aria-labelledby="hero-title"
        onMouseMove={handleMouseMove}
        ref={heroRef}
        style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 0.8s" }}
      >
        <div className="hero-media" aria-hidden="true">
          <img
            ref={bgImgRef}
            className="hero-media__img"
            src={HERO_IMAGES[0]}
            alt=""
            loading="eager"
            fetchPriority="high"
            onLoad={() => setBgReady(true)}
          />
          <div className="hero-overlay" />
        </div>

        <canvas ref={canvasRef} className="hero-flame-canvas" aria-hidden="true" />

        <div ref={meshGlowRef} className="hero-mesh-glow" aria-hidden="true" />
        <div className="hero-floating-orb orb-1" aria-hidden="true" />
        <div className="hero-floating-orb orb-2" aria-hidden="true" />

        <div className="hero-body">
          <div className="hero-inner">
            <div className="hero-badge">
              <span className="hero-badge__dot" />
              Available for Q3 projects
            </div>

            <h1 id="hero-title" className="hero-heading">
              We build premium
              <br />
              digital platforms
            </h1>

            <p className="hero-lead">
              ZEAL crafts high‑performance websites and apps that look
              expensive, convert reliably, and scale with your business.
            </p>

            <div className="hero-actions">
              <a className="hero-btn hero-btn-primary" href="#work" onClick={handleExplore}>
                <span className="hero-btn-label">Explore our work</span>
                <span className="hero-btn-arrow">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </a>

              <a className="hero-btn hero-btn-ghost" href="#contact" onClick={handleContact}>
                <span className="hero-btn-label">Book a demo</span>
                <span className="hero-btn-arrow">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </a>
            </div>

            <ul className="hero-trust">
              {TRUST_ITEMS.map((item, index) => (
                <li
                  key={index}
                  className={`hero-trust__item${
                    activeTrust === index ? " active" : ""
                  }${item.text.includes("Average 3x conversion improvement") ? " trust-highlight" : ""}`}
                  onMouseEnter={() => setActiveTrust(index)}
                  onMouseLeave={() => setActiveTrust(null)}
                >
                  <span aria-hidden="true">{item.icon}</span> {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hero-scroll-wrap">
          <div className="hero-scroll-indicator" onClick={handleExplore} role="button" tabIndex={0} aria-label="Scroll to content">
            <div className="hero-scroll-indicator__mouse">
              <div className="hero-scroll-indicator__wheel" />
            </div>
            <span>Scroll</span>
          </div>
        </div>

        <div className="hero-divider" />
      </section>
    </>
  );
}
