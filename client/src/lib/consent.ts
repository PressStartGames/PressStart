// The visitor's analytics choice (plans/main-site.md phase 4).
//
//   unset    no choice yet: the banner asks, nothing optional is loaded, no cookie is set
//   granted  "Accept": Google Analytics may load; the edge may assign experiments
//   denied   "Decline": nothing optional loads, nothing is stored but this choice
//
// The choice lives in localStorage (no cookie). On Accept it is also written as the functional cookie
// ps_consent=granted, which is how the edge Worker (edge/experiments.ts) learns it may assign an experiment
// variant. Declining or withdrawing removes that cookie, the experiment cookies and Google's cookies.
import { useSyncExternalStore } from 'react';
import {
  CONSENT_COOKIE,
  CONSENT_GRANTED,
  EXPERIMENT_COOKIE,
  VISITOR_COOKIE,
} from '../../../edge/config';

export type Consent = 'granted' | 'denied' | 'unset';

const KEY = 'ps-consent';
const COOKIE_DAYS = 180;
const listeners = new Set<() => void>();
let current: Consent | undefined;
let bannerOpen = false;

export function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const hit = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : undefined;
}

function load(): Consent {
  if (typeof window === 'undefined') return 'unset';
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'granted' || v === 'denied') return v;
  } catch {
    // storage blocked: fall through to the cookie, then to "unset"
  }
  return readCookie(CONSENT_COOKIE) === CONSENT_GRANTED ? 'granted' : 'unset';
}

export function getConsent(): Consent {
  current ??= load();
  return current;
}

function emit() {
  for (const l of listeners) l();
}

export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function secureAttr(): string {
  return location.protocol === 'https:' ? '; Secure' : '';
}

function expire(name: string) {
  const host = location.hostname;
  const parts = host.split('.');
  const domains = ['', `; Domain=${host}`];
  for (let i = 1; i < parts.length - 1; i++) domains.push(`; Domain=.${parts.slice(i).join('.')}`);
  for (const d of domains) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${d}${secureAttr()}`;
  }
}

/** Removes the experiment cookies and every Google Analytics cookie (_ga, _ga_*, _gid, _gat*). */
export function clearOptionalCookies(): void {
  const names = document.cookie.split('; ').map((c) => c.split('=')[0] ?? '');
  for (const n of names) {
    if (n === EXPERIMENT_COOKIE || n === VISITOR_COOKIE || /^(_ga|_gid|_gat)/.test(n)) expire(n);
  }
}

export function setConsent(choice: 'granted' | 'denied'): void {
  current = choice;
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    // storage blocked: the choice holds for this page only
  }
  if (choice === 'granted') {
    document.cookie = `${CONSENT_COOKIE}=${CONSENT_GRANTED}; Path=/; Max-Age=${COOKIE_DAYS * 86400}; SameSite=Lax${secureAttr()}`;
  } else {
    expire(CONSENT_COOKIE);
    clearOptionalCookies();
  }
  bannerOpen = false;
  emit();
}

// The banner shows while there is no choice, and again whenever "Cookie settings" opens it.
export function openConsentBanner(): void {
  bannerOpen = true;
  emit();
}
export function closeConsentBanner(): void {
  bannerOpen = false;
  emit();
}
export function isBannerOpen(): boolean {
  return bannerOpen;
}

export function useConsent(): Consent {
  return useSyncExternalStore(subscribeConsent, getConsent, () => 'unset');
}

export function useBannerOpen(): boolean {
  return useSyncExternalStore(subscribeConsent, isBannerOpen, () => false);
}

const noop = () => () => {};
/** False while the server render is hydrated, true after: browser-only UI renders from here. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/** Test seam: forget the cached choice so the next read reloads it. */
export function resetConsentForTests(): void {
  current = undefined;
  bannerOpen = false;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Sends one analytics event, only while the visitor has accepted. `window.gtag` exists only when Google Analytics
 * is configured and lib/analytics.ts has set it up, so this is a no-op everywhere else. It lives here, in the entry
 * bundle, so the sign-up form can call it without pulling the lazy analytics chunk in.
 */
export function track(name: string, params: Record<string, string | number> = {}): void {
  if (getConsent() !== 'granted') return;
  window.gtag?.('event', name, params);
}
