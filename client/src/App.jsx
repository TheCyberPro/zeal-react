import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { UiProvider } from './components/UiContext.jsx';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Blog from './pages/Blog.jsx';
import Post from './pages/Post.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import { auth } from './lib/api.js';

function RequireAdmin({ children }) {
  return auth.get() ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const out = () => navigate('/admin/login');
    window.addEventListener('zeal-signed-out', out);
    return () => window.removeEventListener('zeal-signed-out', out);
  }, [navigate]);

  useEffect(() => window.scrollTo(0, 0), [pathname]);

  return (
    <UiProvider>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route element={<Layout />}>
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<Post />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<section className="wrap section"><h1>Page not found</h1></section>} />
          </Route>

          <Route path="/admin/login" element={<div className="zx"><Login /></div>} />
          <Route path="/admin" element={<div className="zx"><RequireAdmin><Dashboard /></RequireAdmin></div>} />

        </Routes>
    </UiProvider>
  );
}
