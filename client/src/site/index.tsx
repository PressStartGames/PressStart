// The main site area (/ and every route outside /beta): one lazily loaded chunk (src/lib/areas.tsx).
//
// THE SEAM for plans/main-site.md phase 2: a layout replaces this folder. The contract is only this
// module's `pages` export, which src/routes.tsx renders:
//   layout    the frame (skip link, header with nav and the "Join the beta" button, <main>, footer),
//             rendering <Outlet /> for the page
//   home      /
//   stub      every placeholder page, given `id` (CONTENT.md section `page-<id>`, path from routes.tsx)
//   notFound  anything unknown outside /beta (prerendered to 404.html)
// Nothing under src/beta, src/sections or src/components is imported here, so the beta is untouched by
// whatever this area does. Keep the global stylesheet import last (see areas.tsx).
import type { AreaPages } from '../lib/areas';
import { MainLayout } from './MainLayout';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { Stub } from './pages/Stub';
import './site.css';

export const pages: AreaPages = {
  layout: MainLayout,
  home: Home,
  stub: Stub,
  notFound: NotFound,
};
