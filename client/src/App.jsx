import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Work from './pages/Work.jsx';
import Project from './pages/Project.jsx';
import Journal from './pages/Journal.jsx';
import Post from './pages/Post.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import { auth } from './lib/api.js';

function RequireAdmin({ children }) {
  return auth.get() ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const out = () => navigate('/admin/login');
    window.addEventListener('zeal-signed-out', out);
    return () => window.removeEventListener('zeal-signed-out', out);
  }, [navigate]);

  // Scroll to #section if present, otherwise to the top, on navigation only.
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { el.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<Work />} />
        <Route path="/work/:slug" element={<Project />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/journal/:slug" element={<Post />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<section className="wrap section"><h1>Page not found</h1></section>} />
      </Route>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
    </Routes>
  );
}
