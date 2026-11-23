import { Link } from 'react-router-dom';

export default function About() {
  return (
    <section className="wrap section narrow prose">
      <h1 className="page-title">About ZEAL</h1>
      <img
        className="portrait"
        src="/assets/dev-photo.png"
        alt="The developer behind ZEAL"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      <p className="lede">We build trust into every pixel and craft platforms that feel expensive, move fast, and scale cleanly.</p>
      <p>From brand visuals to disciplined engineering, we design and develop premium websites, apps and onboarding flows that speak your customer's language and strengthen your brand's authority.</p>
      <p><Link className="btn" to="/contact">Book a free consultation</Link></p>
    </section>
  );
}
