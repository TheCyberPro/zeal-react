import React from "react";

export default function Header() {
  return (
    <header className="zeal-header" role="navigation" aria-label="Main">
      <div className="container zeal-nav">
        <div className="nav-left">
          <a href="/" className="nav-link">Home</a>
          <a href="#about" className="nav-link">About</a>
        </div>

        <span className="nav-logo">ZEAL</span>

        <button
          id="exploreToggle"
          className="hamburger"
          aria-label="Toggle Explore Menu"
          aria-expanded="false"
          type="button"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}
