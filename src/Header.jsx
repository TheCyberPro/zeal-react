import React from "react";
import { Link } from "react-router-dom";

export default function Header({ isMenuOpen, onMenuToggle, onExploreToggle }) {
  const handleToggle = onExploreToggle || onMenuToggle;

  return (
    <header className="zeal-header" role="navigation" aria-label="Main">
      <div className="container zeal-nav">
        <div className="nav-left">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/#about" className="nav-link">About</Link>
        </div>

        <Link to="/" className="nav-logo">ZEAL</Link>

        <button
          id="exploreToggle"
          className={`hamburger ${isMenuOpen ? "active" : ""}`}
          aria-label="Toggle Explore Menu"
          aria-expanded={isMenuOpen ? "true" : "false"}
          type="button"
          onClick={handleToggle}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}
