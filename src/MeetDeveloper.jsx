import React, { useRef, useEffect, useState, useCallback } from "react";

export default function MeetDeveloper() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHoveringCard, setIsHoveringCard] = useState(false);

  // Respect reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll reveal
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // Mouse-tracking ambient glow
  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current || prefersReducedMotion) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, [prefersReducedMotion]);

  return (
    <>
      <style>{`
        .meet-developer-heavenly {
          /* Match ContactCTA background exactly for seamless blend */
          --md-bg-deep: #040508;
          --md-bg-top: #0c0e14; 
          --md-card-surface: rgba(255, 255, 255, 0.02);
          --md-card-border: rgba(255, 255, 255, 0.06);
          --md-card-highlight: rgba(255, 255, 255, 0.12);
          --md-gold: #d4af37;
          --md-gold-light: #f5d76e;
          --md-glow: rgba(212, 175, 55, 0.15);
          --md-text-primary: #f8f9fa;
          --md-text-secondary: #9ca3af;
          --md-ease-lux: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          --md-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
          --md-trans-smooth: 0.8s var(--md-ease-lux);
          --md-trans-bounce: 0.6s var(--md-ease-spring);

          position: relative;
          /* Removed bottom padding to allow seamless merge with ContactCTA */
          padding: clamp(6rem, 10vw, 9rem) 1.5rem 0;
          background: radial-gradient(ellipse 130% 80% at 50% 0%, var(--md-bg-top) 0%, var(--md-bg-deep) 65%);
          overflow: hidden;
          isolation: isolate;
          font-family: system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .meet-developer-heavenly::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 140px;
          pointer-events: none;
          z-index: 0;
          mix-blend-mode: overlay;
          opacity: 0.6;
        }

        /* Ambient light effects */
        .ambient-aurora {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }
        .ambient-aurora span {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          animation: aura-drift 30s ease-in-out infinite alternate;
        }
        .ambient-aurora span:nth-child(1) {
          top: -40%; left: 10%; width: 50vw; height: 50vw;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 65%);
        }
        .ambient-aurora span:nth-child(2) {
          bottom: -20%; right: -10%; width: 60vw; height: 60vw;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 60%);
          animation-delay: -15s;
          animation-direction: reverse;
        }

        @keyframes aura-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.08); }
        }

        .meet-dev-wrapper {
          position: relative;
          z-index: 2;
          max-width: 1080px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          perspective: 1200px;
        }

        .meet-dev-card {
          position: relative;
          width: 100%;
          max-width: 960px;
          background: var(--md-card-surface);
          border: 1px solid var(--md-card-border);
          border-radius: 2rem;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          padding: clamp(3rem, 6vw, 4.5rem) clamp(2rem, 5vw, 4rem);
          box-shadow:
            0 40px 100px -24px rgba(0, 0, 0, 0.8),
            inset 0 1px 0 var(--md-card-highlight);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.5rem;
          transition: 
            opacity var(--md-trans-smooth), 
            transform var(--md-trans-smooth),
            border-color 0.5s ease,
            box-shadow 0.5s ease;
          opacity: 0;
          transform: translateY(30px) scale(0.98);
          will-change: transform;
          overflow: hidden;
          cursor: default;
        }
        
        .meet-dev-card.reveal {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .meet-dev-card:hover {
          border-color: rgba(212, 175, 55, 0.2);
          box-shadow:
            0 40px 100px -24px rgba(0, 0, 0, 0.8),
            0 0 30px rgba(212, 175, 55, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        /* Dynamic mouse glow */
        .meet-dev-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            800px circle at var(--mx) var(--my),
            rgba(255, 255, 255, 0.03) 0%,
            transparent 40%
          );
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .meet-dev-card:hover::before {
          opacity: 1;
        }

        /* Top gold accent line */
        .card-accent-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.4) 20%, rgba(245, 215, 110, 0.8) 50%, rgba(212, 175, 55, 0.4) 80%, transparent 100%);
          opacity: 0;
          transform: scaleX(0);
          transition: opacity 0.6s ease 0.4s, transform 0.8s var(--md-ease-spring) 0.2s;
          z-index: 3;
        }
        .meet-dev-card.reveal .card-accent-line {
          opacity: 1;
          transform: scaleX(1);
        }

        .meet-dev-eyebrow {
          margin: 0;
          color: var(--md-gold);
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: 0.75rem;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.6s ease 0.1s, transform 0.6s var(--md-ease-lux) 0.1s;
        }
        .meet-dev-card.reveal .meet-dev-eyebrow {
          opacity: 0.9;
          transform: translateY(0);
        }

        .meet-dev-copy {
          margin: 0;
          font-size: clamp(1.15rem, 2.2vw, 1.4rem);
          line-height: 1.8;
          font-weight: 300;
          color: var(--md-text-secondary);
          text-align: center;
          max-width: 780px;
          text-wrap: balance;
          letter-spacing: 0.01em;
          opacity: 0;
          transform: translateY(15px);
          transition: opacity 0.6s ease 0.2s, transform 0.6s var(--md-ease-lux) 0.2s;
        }
        .meet-dev-card.reveal .meet-dev-copy {
          opacity: 1;
          transform: translateY(0);
        }

        .meet-dev-copy strong {
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, var(--md-gold-light) 40%, var(--md-gold) 80%);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          letter-spacing: -0.01em;
        }

        /* Improved Button */
        .cta-heavenly {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 1.1rem 3.2rem;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          border-radius: 100px;
          background: linear-gradient(145deg, var(--md-gold-light) 0%, var(--md-gold) 40%, #b8941f 100%);
          color: #05060a;
          text-decoration: none;
          box-shadow:
            0 12px 32px -8px rgba(212, 175, 55, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          overflow: hidden;
          cursor: pointer;
          will-change: transform, box-shadow;
          
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          transition: 
            opacity 0.6s ease 0.3s, 
            transform 0.6s var(--md-ease-spring) 0.3s,
            box-shadow 0.4s var(--md-ease-lux);
        }
        
        .meet-dev-card.reveal .cta-heavenly {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Button Shine Effect */
        .cta-heavenly::before {
          content: "";
          position: absolute;
          top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.5) 50%, transparent 80%);
          transform: skewX(-20deg);
          transition: left 0.7s cubic-bezier(0.2, 1, 0.2, 1);
          z-index: 1;
        }
        .cta-heavenly:hover::before { left: 150%; }
        
        .cta-heavenly:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow:
            0 20px 48px -12px rgba(212, 175, 55, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.6),
            0 0 0 1px rgba(245, 215, 110, 0.3);
        }
        
        .cta-heavenly:active {
          transform: translateY(-1px) scale(0.98) !important;
          transition-duration: 0.1s;
        }

        .cta-heavenly:focus-visible {
          outline: 2px solid var(--md-gold-light);
          outline-offset: 6px;
        }

        /* Button Icon */
        .btn-icon {
          margin-right: 8px;
          transition: transform 0.3s ease;
        }
        .cta-heavenly:hover .btn-icon {
          transform: rotate(15deg) scale(1.1);
        }

        @media (max-width: 768px) {
          .meet-developer-heavenly { padding-top: 5rem; }
          .meet-dev-card { padding: 2.5rem 1.5rem; border-radius: 1.5rem; gap: 2rem; }
          .cta-heavenly { width: 100%; padding: 1rem 2rem; }
          .meet-dev-copy { font-size: 1.1rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      <section
        className="meet-developer-heavenly"
        aria-labelledby="meet-dev-title"
        role="region"
        ref={sectionRef}
      >
        <div className="ambient-aurora" aria-hidden="true">
          <span></span>
          <span></span>
        </div>

        <div className="meet-dev-wrapper">
          <div
            className={`meet-dev-card ${isVisible ? "reveal" : ""}`}
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHoveringCard(true)}
            onMouseLeave={() => setIsHoveringCard(false)}
            style={{
              "--mx": `${mousePos.x}%`,
              "--my": `${mousePos.y}%`
            }}
            role="region"
            aria-label="Meet the developer"
          >
            <div className="card-accent-line" />
            
            <p className="meet-dev-eyebrow">The Mind Behind ZEAL</p>
            
            <p className="meet-dev-copy" id="meet-dev-title">
              <strong>ZEAL</strong> — We build trust into every pixel and craft platforms that feel expensive, move fast, and scale cleanly. From glowing brand visuals to disciplined engineering, we design and develop premium websites, apps, and onboarding flows that speak your customer's language and strengthen your brand's authority.
            </p>
            
            <a 
              className="cta-heavenly" 
              href="#contact" 
              aria-label="Book a Free Consultation"
            >
              <svg className="btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Book a Free Consultation
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
