import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getConsent,
  openConsentBanner,
  isBannerOpen,
  resetConsentForTests,
  setConsent,
} from '../../src/lib/consent';

// A minimal browser: localStorage, a cookie jar and location.
function fakeBrowser(storage = true) {
  const store = new Map<string, string>();
  const jar = new Map<string, string>();
  vi.stubGlobal('window', {});
  vi.stubGlobal('location', { protocol: 'https:', hostname: 'www.site.test' });
  vi.stubGlobal(
    'localStorage',
    storage
      ? {
          getItem: (k: string) => store.get(k) ?? null,
          setItem: (k: string, v: string) => void store.set(k, v),
        }
      : {
          getItem: () => {
            throw new Error('blocked');
          },
          setItem: () => {
            throw new Error('blocked');
          },
        },
  );
  vi.stubGlobal('document', {
    get cookie() {
      return [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
    },
    set cookie(line: string) {
      const [pair = '', ...attrs] = line.split('; ');
      const [k = '', v = ''] = pair.split('=');
      if (attrs.some((a) => a === 'Max-Age=0')) jar.delete(k);
      else jar.set(k, v);
    },
  });
  return { store, jar };
}

beforeEach(() => resetConsentForTests());
afterEach(() => vi.unstubAllGlobals());

describe('consent', () => {
  it('starts unset and sets no cookie', () => {
    const { jar } = fakeBrowser();
    expect(getConsent()).toBe('unset');
    expect(jar.size).toBe(0);
  });

  it('Accept stores the choice and the functional ps_consent cookie', () => {
    const { store, jar } = fakeBrowser();
    setConsent('granted');
    expect(getConsent()).toBe('granted');
    expect(store.get('ps-consent')).toBe('granted');
    expect(jar.get('ps_consent')).toBe('granted');
  });

  it('Decline stores only the choice and removes every optional cookie', () => {
    const { store, jar } = fakeBrowser();
    jar.set('ps_consent', 'granted');
    jar.set('ps_exp', 'x');
    jar.set('_ga', 'x');
    jar.set('_ga_ABC', 'x');
    jar.set('other', 'keep');
    setConsent('denied');
    expect(store.get('ps-consent')).toBe('denied');
    expect([...jar.keys()]).toEqual(['other']);
  });

  it('a stored choice is read back after a reload', () => {
    const { store } = fakeBrowser();
    store.set('ps-consent', 'denied');
    expect(getConsent()).toBe('denied');
  });

  it('works with storage blocked: the choice holds for the page, the cookie carries Accept', () => {
    const { jar } = fakeBrowser(false);
    expect(getConsent()).toBe('unset');
    setConsent('granted');
    expect(getConsent()).toBe('granted');
    resetConsentForTests();
    expect(getConsent()).toBe('granted'); // read back from ps_consent
    expect(jar.get('ps_consent')).toBe('granted');
  });

  it('"Cookie settings" reopens the banner and a choice closes it', () => {
    fakeBrowser();
    openConsentBanner();
    expect(isBannerOpen()).toBe(true);
    setConsent('denied');
    expect(isBannerOpen()).toBe(false);
  });
});
