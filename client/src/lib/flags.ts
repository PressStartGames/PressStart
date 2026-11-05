// Feature flags and experiments (plans/main-site.md phase 5), on the GrowthBook JS SDK.
//
// Flags: `join-beta-cta` is a JSON feature { "on": boolean, "label"?: string }. With no
// VITE_GROWTHBOOK_CLIENT_KEY nothing is fetched and the defaults stand: the CTA is on unless
// VITE_FLAG_JOIN_BETA=off (today's behaviour). With a key, the SDK is imported after first paint (it is not in the
// entry chunk), fetches the feature payload (no cookie, no identifier, no attributes) and updates the store; a flag
// flip in GrowthBook reaches visitors on their next page load, without a deploy.
//
// Experiments: chosen at the edge before the HTML is sent (edge/experiments.ts), never in the browser. The prerendered
// page of a variant carries <meta name="ps-variant" content="id:variant">; the client renders exactly that during
// hydration (no mismatch, no flicker) and falls back to the control whenever the visitor has not accepted analytics.
import { useSyncExternalStore } from 'react';
import { EXPERIMENTS, parseAssignments, type ExperimentDef } from '../../../edge/config';
import { getConsent, subscribeConsent } from './consent';

export interface JoinBetaFlag {
  on: boolean;
  label?: string;
}

// Read here, not from config.ts, because config.ts re-exports FLAGS from this module.
const rawEnv = import.meta.env as Record<string, string | undefined>;
const DEFAULT_JOIN_BETA: JoinBetaFlag = { on: (rawEnv.VITE_FLAG_JOIN_BETA ?? '').trim() !== 'off' };

interface FlagState {
  joinBeta: JoinBetaFlag;
}
let state: FlagState = { joinBeta: DEFAULT_JOIN_BETA };
let legacyVersion = 0;
let legacyRead = false;
const listeners = new Set<() => void>();

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Interprets the `join-beta-cta` feature's value; anything malformed keeps the default. */
export function parseJoinBeta(
  value: unknown,
  fallback: JoinBetaFlag = DEFAULT_JOIN_BETA,
): JoinBetaFlag {
  if (typeof value !== 'object' || value === null) return fallback;
  const v = value as { on?: unknown; label?: unknown };
  const out: JoinBetaFlag = { on: typeof v.on === 'boolean' ? v.on : fallback.on };
  if (typeof v.label === 'string' && v.label.trim()) out.label = v.label.trim().slice(0, 40);
  return out;
}

/** Reads every flag from an evaluated GrowthBook instance (or anything shaped like one). */
export function applyFlags(gb: { getFeatureValue(key: string, fallback: unknown): unknown }): void {
  const next: FlagState = { joinBeta: parseJoinBeta(gb.getFeatureValue('join-beta-cta', null)) };
  if (next.joinBeta.on === state.joinBeta.on && next.joinBeta.label === state.joinBeta.label) {
    return;
  }
  state = next;
  if (legacyRead) legacyVersion++;
  for (const l of listeners) l();
}

/** Loads GrowthBook and applies its flags. Does nothing without a client key. Never throws. */
export async function initFlags(clientKey: string, apiHost: string): Promise<void> {
  if (!clientKey) return;
  try {
    const { GrowthBook } = await import('@growthbook/growthbook');
    // No attributes and no tracking callback: flags only. Experiments are the edge's job and need consent.
    const gb = new GrowthBook({ apiHost, clientKey });
    await gb.init({ timeout: 2500 });
    applyFlags(gb);
    gb.destroy();
  } catch {
    // GrowthBook unreachable: the defaults stand
  }
}

export function useJoinBeta(): JoinBetaFlag {
  return useSyncExternalStore(
    subscribe,
    () => state.joinBeta,
    () => DEFAULT_JOIN_BETA,
  );
}

/**
 * The same flag for code that cannot use a hook (the original API). It is always current when read during a
 * render; <App> re-mounts its tree when a flag changes after load, but only if something read this (see
 * useLegacyFlagsVersion), so hook users never pay for it.
 */
export const FLAGS = {
  get joinBeta(): boolean {
    legacyRead = true;
    return state.joinBeta.on;
  },
};

export function useLegacyFlagsVersion(): number {
  return useSyncExternalStore(
    subscribe,
    () => legacyVersion,
    () => 0,
  );
}

// ---- experiments ----

const renderVariants: Record<string, string> = {};
/** The prerender names the variant it is rendering (client/src/entry-server.tsx). */
export function setRenderVariants(map: Record<string, string>): void {
  for (const k of Object.keys(renderVariants)) delete renderVariants[k];
  Object.assign(renderVariants, map);
}

function pageVariant(exp: ExperimentDef): string {
  if (typeof document === 'undefined') return renderVariants[exp.id] ?? exp.control;
  const meta = document.querySelector('meta[name="ps-variant"]')?.getAttribute('content');
  const v = parseAssignments(meta ?? undefined)[exp.id];
  return v && exp.variants.includes(v) ? v : exp.control;
}

/** The variant this page was served as, for a visitor who accepted analytics; otherwise always the control. */
export function useVariant(experimentId: string): string {
  const exp = EXPERIMENTS.find((e) => e.id === experimentId);
  return useSyncExternalStore(
    subscribeConsent,
    // After hydration: a visitor without consent sees the control, always.
    () => (exp && getConsent() === 'granted' ? pageVariant(exp) : (exp?.control ?? 'control')),
    // While hydrating (and on the server): whatever the HTML was prerendered as.
    () => (exp ? pageVariant(exp) : 'control'),
  );
}
