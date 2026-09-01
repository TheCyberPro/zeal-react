// src/App.jsx
import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Contexts */
import { UiProvider, UiContext } from "./UiContext";
import { AuthProvider } from "./AuthContext";

/* Pages */
import HomePage from "./Homepage";
import Marell from "./Marell";
import Calculator from "./Calculator";
import Login from "./Login";
import Register from "./Register";
import Forgot from "./Forgot";
import Terms from "./Terms";
import Privacy from "./Privacy";
import Contact from "./Contact";

/* Components */
import Header from "./Header";
import ExplorePanel from "./ExplorePanel";
import Hero from "./Hero";
import MarellSection from "./MarellSection";
import ServicesSlider from "./ServicesSlider";
import Highlights from "./Highlights";
import MeetDeveloper from "./MeetDeveloper";
import Testimonials from "./Testimonials";
import ContactCTA from "./ContactCTA";
import Footer from "./Footer";
import ProtectedRoute from "./ProtectedRoute";

/* Landing composition */
function Landing() {
  const ui = useContext(UiContext);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  useEffect(() => {
    const isOpen = headerMenuOpen || (ui && ui.exploreOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [headerMenuOpen, ui?.exploreOpen]);

  const toggleHeaderMenu = () => setHeaderMenuOpen((s) => !s);
  const closeHeaderMenu = () => setHeaderMenuOpen(false);
  const openHeaderMenu = () => setHeaderMenuOpen(true);

  const toggleExplore = ui?.setExploreOpen ? () => ui.setExploreOpen((prev) => !prev) : () => {};

  return (
    <div className="app-root">
      <Header
        isMenuOpen={headerMenuOpen}
        onMenuToggle={toggleHeaderMenu}
        openMenu={openHeaderMenu}
        closeMenu={closeHeaderMenu}
        onExploreToggle={toggleExplore}
      />

      <ExplorePanel />

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

/* App root with routes */
export default function App() {
  return (
    <UiProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<HomePage />} />

            {/* Auth routes */}
            <Route path="/marell/login" element={<Login />} />
            <Route path="/marell/register" element={<Register />} />
            <Route path="/marell/forgot" element={<Forgot />} />

            {/* Public pages */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/marell/calculator" element={<Calculator />} />

            {/* Protected Marell area */}
            <Route
              path="/marell"
              element={
                <ProtectedRoute>
                  <Marell />
                </ProtectedRoute>
              }
            />

            {/* Fallback: show Landing */}
            <Route path="*" element={<Landing />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </UiProvider>
  );
}
