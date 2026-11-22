import Shell from '../components/Shell.jsx';
import Hero from '../components/Hero.jsx';
import ServicesSlider from '../components/ServicesSlider.jsx';
import Highlights from '../components/Highlights.jsx';
import MeetDeveloper from '../components/MeetDeveloper.jsx';
import Testimonials from '../components/Testimonials.jsx';
import ContactCTA from '../components/ContactCTA.jsx';

export default function Landing() {
  return (
    <Shell>
      <main style={{ paddingTop: 80 }}>
        <Hero />
        <div className="container services-block"><ServicesSlider /></div>
        <div className="container highlights-block"><Highlights /></div>
        <div className="container meet-dev-block"><MeetDeveloper /></div>
        <div className="container testimonials-block"><Testimonials /></div>
        <div className="container contact-cta-wrapper">
          <div className="contact-cta-block"><ContactCTA /></div>
        </div>
      </main>
    </Shell>
  );
}
