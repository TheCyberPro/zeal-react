// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";









import "./fonts.css";
import "./assets/css/styles.css";

/* Contexts */
import { UiProvider } from "./contexts/UiContext";
import { AuthProvider } from "./contexts/AuthContext";

/* Pages */
import HomePage from "./pages/HomePage";
import Marell from "./pages/Marell/Marell";
import Calculator from "./pages/Marell/Calculator";
import Login from "./pages/Marell/Login";
import Register from "./pages/Marell/Register";
import Forgot from "./pages/Marell/Forgot";
import Terms from "./pages/Marell/Terms";
import Privacy from "./pages/Marell/Privacy";
import Contact from "./pages/Marell/Contact";

/* Components */
import Header from "./components/Header";
import ExplorePanel from "./components/ExplorePanel";
import Hero from "./components/Hero";
import MarellSection from "./components/MarellSection";
import ServicesSlider from "./components/ServicesSlider";
import Highlights from "./components/Highlights";
import MeetDeveloper from "./components/MeetDeveloper";
import Testimonials from "./components/Testimonials";
import ContactCTA from "./components/ContactCTA";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

/* Optional extras removed: InstagramCard, DeveloperCard, Slider */

/* Landing composition (render components directly, with safe wrappers) */
function Landing({
  onHeaderMenuToggle,
  headerMenuOpen,
  openHeaderMenu,
  closeHeaderMenu,
}) {
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isExploreOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExploreOpen]);

  const openExplore = () => setIsExploreOpen(true);
  const closeExplore = () => setIsExploreOpen(false);
  const toggleExplore = () => setIsExploreOpen((s) => !s);

  return (
    <div className="app-root">
      <Header
        isMenuOpen={headerMenuOpen}
        onExploreToggle={toggleExplore}
        onExploreOpen={openExplore}
        onExploreClose={closeExplore}
        onMenuToggle={onHeaderMenuToggle}
        openMenu={openHeaderMenu}
        closeMenu={closeHeaderMenu}
      />

      <ExplorePanel isOpen={isExploreOpen} onClose={closeExplore} />

      <main style={{ paddingTop: 80 }}>
        <Hero />

        <div className="container marell-block">
          <MarellSection />
        </div>

        <div className="container services-block">
          <ServicesSlider />
        </div>

        <div className="container highlights-block">
          <Highlights />
        </div>

        <div className="container meet-dev-block">
          <MeetDeveloper />
        </div>

        <div className="container testimonials-block">
          <Testimonials />
        </div>

        {/* Contact CTA only (InstagramCard and DeveloperCard removed) */}
        <div className="container contact-cta-wrapper">
          <div className="contact-cta-block">
            <ContactCTA />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* App root with routes and header menu wiring */
export default function App() {
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = headerMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [headerMenuOpen]);

  const toggleHeaderMenu = () => setHeaderMenuOpen((s) => !s);
  const closeHeaderMenu = () => setHeaderMenuOpen(false);
  const openHeaderMenu = () => setHeaderMenuOpen(true);

  return (
    <UiProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <Landing
                  onHeaderMenuToggle={toggleHeaderMenu}
                  headerMenuOpen={headerMenuOpen}
                  openHeaderMenu={openHeaderMenu}
                  closeHeaderMenu={closeHeaderMenu}
                />
              }
            />
            <Route path="/home" element={<HomePage />} />

            {/* Auth routes */}
            <Route path="/marell/login" element={<Login />} />
            <Route path="/marell/register" element={<Register />} />
            <Route path="/marell/forgot" element={<Forgot />} />
<Route path="/marell/Marell" element={<Marell />} />


            {/* Public pages */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/marell/calculator" element={<Calculator />} />

            {/* Protected Marell area */}
            <Route path="/Marell/Marell"element={ <ProtectedRoute> <Marell />
                </ProtectedRoute>
              }
            />

            {/* Fallback: show Landing */}
            <Route
              path="*"
              element={
                <Landing
                  onHeaderMenuToggle={toggleHeaderMenu}
                  headerMenuOpen={headerMenuOpen}
                  openHeaderMenu={openHeaderMenu}
                  closeHeaderMenu={closeHeaderMenu}
                />
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </UiProvider>
  );
}
