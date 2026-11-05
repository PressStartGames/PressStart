// The beta area (/beta/*): one lazily loaded chunk (src/lib/areas.tsx). The imports keep the order the
// beta had at the root, components first and the global stylesheet last, so its cascade is unchanged.
import type { AreaPages } from '../lib/areas';
import { BetaLayout } from './BetaLayout';
import { Confirmed } from './pages/Confirmed';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { Privacy } from './pages/Privacy';
import '../styles/base.css';

export const pages: AreaPages = {
  layout: BetaLayout,
  home: Home,
  privacy: Privacy,
  confirmed: Confirmed,
  notFound: NotFound,
};
