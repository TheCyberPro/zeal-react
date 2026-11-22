import React, { useEffect, useRef, useState } from "react";

export default function DeveloperCard() {
  const rootRef = useRef(null);
  const headingOrbitRef = useRef(null);
  const ctaOrbitRef = useRef(null);
  const [thinking, setThinking] = useState(true);

  useEffect(() => {
    const headingEl = headingOrbitRef.current;
    const ctaEl = ctaOrbitRef.current;
    if (!headingEl && !ctaEl) return;

    // two orbit targets with independent speeds
    const targets = [
      { el: headingEl, speed: 26 }, // heading orbit speed (deg/sec)
      { el: ctaEl, speed: 48 }      // CTA orbit speed (deg/sec)
    ].filter(t => t.el);

    let rafId = null;
    let last = performance.now();
    const angles = targets.map(() => 0);

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      targets.forEach((t, i) => {
        angles[i] = (angles[i] + t.speed * dt) % 360;
        t.el.style.setProperty("--orbit-rot", `${angles[i]}deg`);
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // demo thinking state; replace with real async logic
    const timer = setTimeout(() => setThinking(false), 2200);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, []);

  return (
    <article className="s-card developer-card meet-developer-orbit" ref={rootRef} aria-labelledby="dev-title">
      <div
        className="s-card-media dev-photo"
        role="img"
        aria-label="Developer photo"
        style={{ backgroundImage: "url('/assets/dev-photo.png')" }}
      />
      <div className="s-card-body">
        <h5 id="dev-title" className="meet-heading-wrap">
          <span className="meet-heading" ref={headingOrbitRef}>
            Meet the developer
            <span className="text-orbit" aria-hidden="true">
              <span className="text-orbit-path" />
              <span className="text-orbit-orb" />
            </span>
          </span>
        </h5>

        <p className="developer__intro meet-dev-copy">
          <strong>ZEAL</strong> — We build trust into every pixel and craft platforms that feel expensive, move fast, and scale cleanly. From glowing brand visuals to disciplined engineering, we design and develop premium websites, apps, and onboarding flows that speak your customer’s language and strengthen your brand’s authority.
        </p>

        <div className="cta-row" ref={ctaOrbitRef}>
          <a href="#contact" className="btn btn--secondary book-consult" aria-label="Book a Free Consultation">
            Book a Free Consultation
          </a>

          <span className="cta-orbit" aria-hidden="true">
            <span className="cta-orbit-path" />
            <span className="cta-orbit-orb" />
          </span>

          <span className={`thinking-dots ${thinking ? "visible" : "hidden"}`} aria-hidden="true">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </span>
        </div>
      </div>
    </article>
  );
}
