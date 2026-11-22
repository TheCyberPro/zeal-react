import { Outlet } from 'react-router-dom';
import Shell from './Shell.jsx';

// Wraps the new pages (blog, contact) in your header/footer.
export default function Layout() {
  return (
    <Shell>
      <main className="zx" style={{ paddingTop: 80 }}>
        <Outlet />
      </main>
    </Shell>
  );
}
