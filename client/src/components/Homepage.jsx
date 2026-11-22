import React from "react";
import Header from "./Header";
import Hero from "./Hero";
import ExplorePanel from "./ExplorePanel";
import MarellSection from "./MarellSection";
import Footer from "./Footer";
import ServicesSlider from "./ServicesSlider";
import Highlights from "./Highlights";
import Testimonials from "./Testimonials";
import InstagramCard from "./InstagramCard";
import DeveloperCard from "./DeveloperCard";
import ContactCTA from "./ContactCTA";

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <main>
        <ServicesSlider />
        <MarellSection />
        <Highlights />
        <Testimonials />
        <InstagramCard />
        <div className="container showcase-row" style={{ marginTop: "1rem" }}>
          <DeveloperCard />
        </div>
        <ContactCTA />
      </main>
      <ExplorePanel />
      <Footer />
    </>
  );
}
