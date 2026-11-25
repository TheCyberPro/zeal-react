import { NavLink, Outlet, Link } from 'react-router-dom';
import ChatWidget from './ChatWidget.jsx';
import Logo from './Logo.jsx';

export default function Layout() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="wrap bar">
          <Link to="/" className="wordmark" aria-label="ZEAL home"><Logo /></Link>
          <nav aria-label="Main">
            <NavLink to="/work">Work</NavLink>
            <NavLink to="/about" className="hide-xs">About</NavLink>
            <NavLink to="/contact?demo=1" className="nav-cta">Book a demo</NavLink>
          </nav>
        </div>
      </header>
      <main id="main"><Outlet /></main>
      <footer className="site-footer">
        <div className="wrap foot">
          <span>© {new Date().getFullYear()} ZEAL. Web development studio.</span>
          <span className="foot-links">
            <Link to="/#services">Services</Link>
            <Link to="/#process">Process</Link>
            <Link to="/journal">Journal</Link>
            <Link to="/about">About</Link>
            <a href="/catalogue.html">Request the catalogue</a>
            <Link to="/admin">Admin</Link>
          </span>
        </div>
      </footer>
      <ChatWidget />
    </>
  );
}
