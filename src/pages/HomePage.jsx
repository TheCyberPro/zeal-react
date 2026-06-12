import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import ExplorePanel from "../components/ExplorePanel";
import MarellSection from "../components/MarellSection";
import Footer from "../components/Footer";
import ServicesSlider from "../components/ServicesSlider";
import Highlights from "../components/Highlights";
import Testimonials from "../components/Testimonials";
import InstagramCard from "../components/InstagramCard";
import DeveloperCard from "../components/DeveloperCard";
import ContactCTA from "../components/ContactCTA";

export default function HomePage() {
  const services = [
    { icon: "fas fa-user-check", title: "Onboard", text: "Fully compliant, automated onboarding flows that reduce friction and build trust from day one." },
    { icon: "fas fa-globe", title: "Websites", text: "Responsive, conversion‑focused websites that elevate brand authority and deliver clarity." },
    { icon: "fas fa-mobile-alt", title: "Apps", text: "Seamless iOS and Android apps built for performance, polish, and longevity." },
    { icon: "fas fa-bezier-curve", title: "UX / UI", text: "Brand‑aligned interfaces that combine luxury aesthetics with operator‑grade usability." }
  ];

  const highlights = [
    { title: "SaaS speed uplift", text: "We made the platform load much faster, helping more visitors convert." },
    { title: "Staffing automation", text: "We automated onboarding so businesses save time and avoid mistakes." },
    { title: "Executive‑grade dashboards", text: "We designed clear dashboards that help leaders make better decisions." },
    { title: "Reliable mobile experience", text: "The platform now works smoothly on all phones, even with slow networks." },
    { title: "Payment integration", text: "We added secure payment options — card, transfer, or mobile money." },
    { title: "Security upgrade", text: "We improved security so your data stays safe and trusted." },
    { title: "User‑friendly design", text: "We simplified the interface so anyone can use it easily." },
    { title: "Easy content updates", text: "You can now update your site without calling a developer." }
  ];

  const testimonials = [
    { quote: "ZEAL transformed our platform into a premium experience. Our customers noticed immediately.", author: "— Alex R., CEO of StartupX" },
    { quote: "The polish and speed improvements were night and day. ZEAL brought discipline and craft.", author: "— Maya D., Product Lead" },
    { quote: "Onboarding drop‑off fell dramatically. The flow feels effortless and branded.", author: "— Daniel K., Operations" },
    { quote: "Zeal is reliable & remarkable. Their services are top-notch, making every process simple and delivering efficient results consistently.", author: "— Young M., CEO TDD" }
  ];

  return (
    <>
      <Header />
      <Hero />
      <main>
        <ServicesSlider items={services} />
        <MarellSection />
        <Highlights items={highlights} />
        <Testimonials items={testimonials} />
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
