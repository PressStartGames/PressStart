import { Suspense, useEffect } from 'react';
import { useLocation, useRoutes } from 'react-router';
import { resolveRoute, routes } from './routes';

// One app, two areas (src/routes.tsx). Each area's layout owns its skip link, header, <main> and
// footer; the prerendered <head> carries the first page's meta, RouteHead keeps it in step after.
export function App() {
  const element = useRoutes(routes);
  return (
    <>
      <RouteHead />
      <Suspense fallback={null}>{element}</Suspense>
    </>
  );
}

function RouteHead() {
  const { pathname } = useLocation();
  useEffect(() => {
    const { meta } = resolveRoute(pathname);
    if (document.title !== meta.title) document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
  }, [pathname]);
  return null;
}
