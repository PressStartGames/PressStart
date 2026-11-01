import { Route, Routes } from 'react-router';
import { Header } from './components/Header';
import { Confirmed } from './pages/Confirmed';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { Privacy } from './pages/Privacy';

export function App() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/confirmed" element={<Confirmed />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
