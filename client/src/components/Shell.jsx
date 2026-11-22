import { useContext, useEffect } from 'react';
import { UiContext } from './UiContext.jsx';
import Header from './Header.jsx';
import ExplorePanel from './ExplorePanel.jsx';
import Footer from './Footer.jsx';

export default function Shell({ children }) {
  const ui = useContext(UiContext);
  const open = !!ui?.exploreOpen;

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div className="app-root">
      <Header isMenuOpen={open} onExploreToggle={() => ui?.setExploreOpen?.((p) => !p)} />
      <ExplorePanel />
      {children}
      <Footer />
    </div>
  );
}
