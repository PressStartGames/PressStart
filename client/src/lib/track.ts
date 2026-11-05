// Sends one analytics event, only while the visitor has accepted and Google Analytics is configured. Tiny on purpose:
// the sign-up form imports it, while everything that sets analytics up (lib/analytics.ts) loads lazily.
import { GA_MEASUREMENT_ID } from './config';
import { getConsent } from './consent';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(name: string, params: Record<string, string | number> = {}): void {
  if (!GA_MEASUREMENT_ID || getConsent() !== 'granted') return;
  window.gtag?.('event', name, params);
}
