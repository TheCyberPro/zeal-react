import { NavLink, Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="wrap bar">
          <Link to="/" className="wordmark">ZEAL</Link>
          <nav aria-label="Main">
            <NavLink to="/work">Work</NavLink>
            <Link to="/#services">Services</Link>
            <Link to="/#process">Process</Link>
            <NavLink to="/journal">Journal</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact" className="nav-cta">Start a project</NavLink>
          </nav>
        </div>
      </header>
      <main id="main"><Outlet /></main>
      <footer className="site-footer">
        <div className="wrap foot">
          <span>© {new Date().getFullYear()} ZEAL. Web development studio.</span>
          <span className="foot-links">
            <a href="/assets/catalogue.pdf">Catalogue (PDF)</a>
            <Link to="/journal">Journal</Link>
            <Link to="/admin">Admin</Link>
          </span>
        </div>
      </footer>
    </>
  );
}
