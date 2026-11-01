// Cloudflare Turnstile, loaded only when a real endpoint and a site key are configured, and only once
// the sign-up form is about to be used. "interaction-only" keeps the widget invisible unless a
// challenge is needed; the token is fetched at submit.
interface Turnstile {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  execute: (id: string) => void;
  reset: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
    __turnstileReady?: () => void;
  }
}

let loading: Promise<Turnstile> | null = null;

export function loadTurnstile(): Promise<Turnstile> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    window.__turnstileReady = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('turnstile missing'));
    };
    const s = document.createElement('script');
    s.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__turnstileReady&render=explicit';
    s.async = true;
    s.onerror = () => reject(new Error('turnstile failed to load'));
    document.head.appendChild(s);
  });
  return loading;
}

export async function getTurnstileToken(container: HTMLElement, siteKey: string): Promise<string> {
  const ts = await loadTurnstile();
  return new Promise((resolve, reject) => {
    const id = ts.render(container, {
      sitekey: siteKey,
      appearance: 'interaction-only',
      execution: 'execute',
      callback: (token: string) => {
        resolve(token);
        ts.reset(id);
      },
      'error-callback': () => reject(new Error('turnstile error')),
      'expired-callback': () => reject(new Error('turnstile expired')),
    });
    ts.execute(id);
  });
}
