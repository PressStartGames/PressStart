import { lazy, Suspense, useEffect } from 'react';
import { useLocation, useRoutes } from 'react-router';
import { ANALYTICS_ENABLED } from './lib/config';
import { useHydrated } from './lib/consent';
import { useLegacyFlagsVersion } from './lib/flags';
import { resolveRoute, routes } from './routes';

// The consent banner and the page-view events are one lazy chunk, mounted only in the browser after hydration: the prerendered HTML and the
// no-JS page never contain it, and it adds nothing to the entry bundle.
const ConsentLayer = lazy(() => import('./components/ConsentLayer'));

// One app, two areas (src/routes.tsx). Each area's layout owns its skip link, header, <main> and
// footer; the prerendered <head> carries the first page's meta, RouteHead keeps it in step after.
export function App() {
  const element = useRoutes(routes);
  const hydrated = useHydrated();
  // Code that reads FLAGS.joinBeta without a hook is re-rendered from the top when a GrowthBook flag changes.
  const flagsVersion = useLegacyFlagsVersion();
  return (
    <>
      <RouteHead />
      <Suspense key={flagsVersion} fallback={null}>
        {element}
      </Suspense>
      {hydrated && ANALYTICS_ENABLED && (
        <Suspense fallback={null}>
          <ConsentLayer />
        </Suspense>
      )}
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
