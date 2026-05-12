import React, { useRef, useState, useEffect } from "react";

export default function Slider({ children, perPage = 3 }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);

  const slideCount = React.Children.count(children);
  const maxIndex = Math.max(0, Math.ceil(slideCount / perPage) - 1);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const width = track.clientWidth;
    track.style.transform = `translateX(-${index * (100)}%)`;
  }, [index]);

  function prev() { setIndex((i) => Math.max(0, i - 1)); }
  function next() { setIndex((i) => Math.min(maxIndex, i + 1)); }

  return (
    <div className="services-slider" aria-roledescription="carousel">
      <button className="slider-btn" onClick={prev} aria-label="Previous">‹</button>
      <div className="slider-track-wrap">
        <ul className="slider-track" ref={trackRef} style={{ width: `${(slideCount / perPage) * 100}%` }}>
          {React.Children.map(children, (child, i) => (
            <li className="slide" key={i} style={{ flex: `0 0 ${100 / (slideCount)}%` }}>
              {child}
            </li>
          ))}
        </ul>
      </div>
      <button className="slider-btn" onClick={next} aria-label="Next">›</button>
      <div className="slider-dots" role="tablist">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button key={i} className={`slider-dot ${i === index ? "active" : ""}`} onClick={() => setIndex(i)} aria-label={`Go to slide ${i+1}`} />
        ))}
      </div>
    </div>
  );
}
