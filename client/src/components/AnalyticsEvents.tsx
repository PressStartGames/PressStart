import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { initAnalytics, trackExperimentViews, trackPageView } from '../lib/analytics';
import { track, useConsent } from '../lib/consent';

// Reports page views on client navigation (and the first page once consent is given), the sign-up confirmation,
// and the experiment exposure. Renders nothing. Every call is a no-op until the visitor has accepted.
export function AnalyticsEvents() {
  const { pathname } = useLocation();
  const consent = useConsent();
  useEffect(() => {
    initAnalytics(); // idempotent: the consent defaults and the subscription must exist before the first event
    if (consent !== 'granted') return;
    trackPageView(pathname, document.title);
    trackExperimentViews(pathname);
    if (/^\/beta\/confirmed\/?$/.test(pathname)) track('sign_up_confirmed');
  }, [pathname, consent]);
  return null;
}
