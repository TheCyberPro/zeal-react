// src/components/Header.jsx
import React, { useContext } from "react";
import { UiContext } from "../contexts/UiContext";

export default function Header() {
  const { exploreOpen, setExploreOpen } = useContext(UiContext);

  const toggleExplore = () => setExploreOpen((prev) => !prev);

  return (
    <header
      className={`zeal-header ${exploreOpen ? "is-explore-open" : ""}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="zeal-nav container">
        <div className="nav-left" aria-hidden="true" />
        <div className="nav-center" />

        <div className="nav-right top-right-cluster" role="toolbar" aria-label="Header actions">
          <button
            id="exploreToggle"
            className={`hamburger one-line ${exploreOpen ? "is-open" : ""}`}
            aria-label={exploreOpen ? "Close explore panel" : "Open explore panel"}
            aria-expanded={exploreOpen}
            type="button"
            onClick={toggleExplore}
          >
            <span aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
