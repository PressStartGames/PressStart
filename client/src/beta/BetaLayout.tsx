import { Outlet } from 'react-router';
import { Header } from '../components/Header';

// The beta landing page's frame, exactly as it was at the site's root: skip link, the chassis bar,
// and <main> holding the page (home, privacy, confirmed, not found).
export function BetaLayout() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
    </>
  );
}
