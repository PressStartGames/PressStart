// Analytics (plans/main-site.md phase 4), all off when its env value is unset.
//
//   Cloudflare Web Analytics  cookieless, for everyone: the beacon is added after load when VITE_CF_BEACON_TOKEN is set.
//   Google Analytics 4        only after "Accept". Consent Mode v2 defaults are all "denied" and are pushed before
//                             anything else; gtag.js is requested only once consent is granted; "Decline" loads
//                             nothing; withdrawing denies again, sets Google's disable flag and removes its cookies.
//
// Events carry no personal data: a page path, a fixed event name, the experiment id and variant index.
import { EXPERIMENTS, EXPERIMENT_COOKIE, parseAssignments } from '../../../edge/config';
import { CF_BEACON_TOKEN, GA_MEASUREMENT_ID } from './config';
import { clearOptionalCookies, getConsent, readCookie, subscribeConsent, track } from './consent';

const analyticsEnabled = GA_MEASUREMENT_ID !== '';

const DENIED = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'denied',
};

let started = false;
let gaLoaded = false;

/** The beacon's markup attributes (a pure function so a unit test can pin them). */
export function beaconAttributes(token: string): { src: string; 'data-cf-beacon': string } {
  return {
    src: 'https://static.cloudflareinsights.com/beacon.min.js',
    'data-cf-beacon': JSON.stringify({ token, spa: true }),
  };
}

function addBeacon() {
  const s = document.createElement('script');
  s.defer = true;
  for (const [k, v] of Object.entries(beaconAttributes(CF_BEACON_TOKEN))) s.setAttribute(k, v);
  document.head.append(s);
}

function setupGtag() {
  window.dataLayer ??= [];
  // Google's snippet pushes the `arguments` object itself, not an array, so the queue is read as commands.
  window.gtag ??= function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };
  window.gtag('consent', 'default', DENIED);
}

function loadGa() {
  if (gaLoaded) return;
  gaLoaded = true;
  const gtag = window.gtag;
  if (!gtag) return;
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
  gtag('consent', 'update', {
    ad_storage: 'denied', // we run no advertising
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
    functionality_storage: 'granted',
    personalization_storage: 'denied',
    security_storage: 'granted',
  });
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.append(s);
}

function applyConsent() {
  if (getConsent() === 'granted') {
    loadGa();
    return;
  }
  if (gaLoaded) {
    window.gtag?.('consent', 'update', DENIED);
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
    clearOptionalCookies();
  }
}

/** A click that sends the visitor to the beta's sign-up: the "Join the beta" button, the beta's START key. */
export function isJoinBetaClick(href: string, from: URL): boolean {
  let url: URL;
  try {
    url = new URL(href, from);
  } catch {
    return false;
  }
  if (url.origin !== from.origin) return false;
  if (url.hash === '#signup') return true;
  const inApp = (p: string) => p.slice(import.meta.env.BASE_URL.length - 1);
  // A link to the beta's home counts when it is followed from outside the beta (its own wordmark does not).
  const toBetaHome = /^\/beta\/?$/.test(inApp(url.pathname)) && !url.hash;
  return toBetaHome && !inApp(from.pathname).startsWith('/beta');
}

function onClick(e: MouseEvent) {
  const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
  if (a && isJoinBetaClick(a.getAttribute('href') ?? '', new URL(location.href))) {
    track('join_beta_click', { page_path: location.pathname });
  }
}

/** Starts analytics once, after the page is interactive. Safe to call again. */
export function initAnalytics(): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  if (analyticsEnabled) {
    setupGtag(); // the denied defaults go first, before any tag exists
    subscribeConsent(applyConsent);
    applyConsent();
    document.addEventListener('click', onClick, true); // capture: runs before the router navigates
  }
  if (CF_BEACON_TOKEN) addBeacon();
}

export function trackPageView(path: string, title: string): void {
  track('page_view', {
    page_path: path,
    page_location: location.origin + path,
    page_title: title,
  });
}

/** Reports which variant of each experiment this visitor was assigned (GrowthBook's GA4 shape). */
export function trackExperimentViews(pathname: string): void {
  const assigned = parseAssignments(readCookie(EXPERIMENT_COOKIE));
  for (const e of EXPERIMENTS) {
    const variant = assigned[e.id];
    if (e.route !== pathname || !variant) continue;
    track('experiment_viewed', {
      experiment_id: e.id,
      variation_id: Math.max(0, e.variants.indexOf(variant)),
    });
  }
}
