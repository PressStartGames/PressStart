// Phase 4 and 5 (plans/main-site.md): the consent banner, Google Analytics only after Accept, the cookieless
// beacon, the events, and the feature flags / experiment variants. The e2e build carries fake ids
// (scripts/build-e2e.ts); every request these specs could make is stubbed here, nothing leaves the machine.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const GA_HOST = 'googletagmanager.com';
const BEACON_HOST = 'cloudflareinsights.com';
const GB_FEATURES = 'http://127.0.0.1:9/api/features/sdk-e2efake';

interface Watch {
  ga: string[];
  beacon: string[];
}

// Stubs the third parties and records which of them the page asked for.
async function watch(page: Page): Promise<Watch> {
  const w: Watch = { ga: [], beacon: [] };
  await page.route(`**/*${GA_HOST}/**`, (route) => {
    w.ga.push(route.request().url());
    return route.fulfill({ contentType: 'text/javascript', body: '' });
  });
  await page.route(`**/*${BEACON_HOST}/**`, (route) => {
    w.beacon.push(route.request().url());
    return route.fulfill({ contentType: 'text/javascript', body: '' });
  });
  return w;
}

const dataLayer = (page: Page) =>
  page.evaluate(() =>
    ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? []).map((e) =>
      Array.from(e),
    ),
  );

const banner = (page: Page) => page.getByRole('region', { name: 'Cookie consent' });

test.describe('consent', () => {
  test('before any choice: banner shown, Consent Mode defaults denied, no cookie, no Google request', async ({
    page,
    context,
  }) => {
    const w = await watch(page);
    await page.goto('/');
    await expect(banner(page)).toBeVisible();
    await page.waitForTimeout(800);
    expect(await context.cookies()).toEqual([]);
    expect(w.ga).toEqual([]);
    const first = (await dataLayer(page))[0];
    expect(first?.slice(0, 2)).toEqual(['consent', 'default']);
    expect(first?.[2]).toMatchObject({
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  });

  test('the cookieless beacon loads for everyone, before any choice', async ({ page }) => {
    const w = await watch(page);
    await page.goto('/beta/');
    await expect.poll(() => w.beacon.length, { timeout: 5_000 }).toBeGreaterThan(0);
    const tag = await page.locator('script[data-cf-beacon]').getAttribute('data-cf-beacon');
    expect(JSON.parse(tag ?? '{}')).toMatchObject({ token: 'e2e-fake-beacon-token' });
  });

  test('Accept loads Google, writes the choice cookie, sends a page view and stays gone after a reload', async ({
    page,
    context,
  }) => {
    const w = await watch(page);
    await page.goto('/');
    await banner(page).getByRole('button', { name: 'Accept' }).click();
    await expect(banner(page)).toBeHidden();
    await expect.poll(() => w.ga.length).toBeGreaterThan(0);
    expect(w.ga[0]).toContain('id=G-E2ETEST000');
    const names = (await context.cookies()).map((c) => c.name);
    expect(names).toContain('ps_consent');
    const events = await dataLayer(page);
    expect(events.some((e) => e[0] === 'consent' && e[1] === 'update')).toBe(true);
    expect(events.some((e) => e[0] === 'event' && e[1] === 'page_view')).toBe(true);

    await page.reload();
    await page.waitForTimeout(600);
    await expect(banner(page)).toHaveCount(0);
    await expect.poll(() => w.ga.length).toBeGreaterThan(1);
  });

  test('Decline sets no cookie, loads nothing from Google and the banner stays gone', async ({
    page,
    context,
  }) => {
    const w = await watch(page);
    await page.goto('/');
    await banner(page).getByRole('button', { name: 'Decline' }).click();
    await expect(banner(page)).toBeHidden();
    await page.reload();
    await page.waitForTimeout(800);
    await expect(banner(page)).toHaveCount(0);
    expect(w.ga).toEqual([]);
    expect(await context.cookies()).toEqual([]);
    expect(
      (await dataLayer(page)).filter((e) => e[0] === 'event' || e[0] === 'js' || e[0] === 'config'),
    ).toEqual([]);
  });

  test('Cookie settings reopens the banner; switching to Decline removes Google and the choice cookie', async ({
    page,
    context,
  }) => {
    await watch(page);
    await page.goto('/');
    await banner(page).getByRole('button', { name: 'Accept' }).click();
    await context.addCookies([{ name: '_ga', value: 'x', url: 'http://localhost' }]);
    await page.getByRole('contentinfo').getByRole('button', { name: 'Cookie settings' }).click();
    await expect(banner(page)).toBeVisible();
    await banner(page).getByRole('button', { name: 'Decline' }).click();
    await expect(banner(page)).toBeHidden();
    expect(await context.cookies()).toEqual([]);
    // the choice survives a reload
    await page.reload();
    await page.waitForTimeout(500);
    await expect(banner(page)).toHaveCount(0);
  });

  test('the beta footer carries Cookie settings too', async ({ page }) => {
    await watch(page);
    await page.goto('/beta/privacy');
    await expect(
      page.getByLabel('Footer').getByRole('button', { name: 'Cookie settings' }),
    ).toBeVisible();
  });

  test('the banner is reachable by keyboard, announces the choice and has no axe violations', async ({
    page,
  }) => {
    await watch(page);
    await page.goto('/');
    await expect(banner(page)).toBeVisible();
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
    // not a trap: the page behind stays focusable; the banner is last in tab order
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await banner(page).getByRole('button', { name: 'Decline' }).focus();
    await page.keyboard.press('Enter');
    await expect(
      page.locator('[aria-live=polite]').filter({ hasText: 'Analytics is off.' }),
    ).toBeAttached();
  });

  test('without JavaScript there is no banner and nothing is requested', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    const seen: string[] = [];
    page.on('request', (r) => seen.push(r.url()));
    await page.goto('/');
    await expect(banner(page)).toHaveCount(0);
    expect(seen.filter((u) => u.includes(GA_HOST) || u.includes(BEACON_HOST))).toEqual([]);
    expect(await context.cookies()).toEqual([]);
    await context.close();
  });
});

test.describe('events', () => {
  async function accepted(page: Page) {
    const w = await watch(page);
    await page.addInitScript(() => localStorage.setItem('ps-consent', 'granted'));
    return w;
  }

  test('client navigation sends a page view; "Join the beta" sends a click event', async ({
    page,
  }) => {
    await accepted(page);
    await page.goto('/');
    await expect
      .poll(async () => (await dataLayer(page)).filter((e) => e[1] === 'page_view').length)
      .toBe(1);
    await page
      .getByRole('navigation', { name: 'Site' })
      .getByRole('link', { name: 'Engine' })
      .click();
    await expect
      .poll(async () => (await dataLayer(page)).filter((e) => e[1] === 'page_view').length)
      .toBe(2);
    // The button is a plain link (a full page load); hold the navigation so the page's event queue can be read.
    await page.evaluate(() => document.addEventListener('click', (e) => e.preventDefault()));
    await page.getByRole('banner').getByRole('link', { name: 'Join the beta' }).click();
    await expect
      .poll(async () => (await dataLayer(page)).some((e) => e[1] === 'join_beta_click'))
      .toBe(true);
    const events = (await dataLayer(page)).filter((e) => e[0] === 'event');
    expect(JSON.stringify(events)).not.toMatch(/@|email/i);
  });

  test('a sign-up sends sign_up_submitted without the address', async ({ page }) => {
    await accepted(page);
    await page.goto('/beta/#signup');
    await page.getByLabel('Email').fill('player@example.com');
    await page.getByRole('button', { name: 'Request access' }).click();
    await expect
      .poll(async () => (await dataLayer(page)).some((e) => e[1] === 'sign_up_submitted'), {
        timeout: 5_000,
      })
      .toBe(true);
    expect(JSON.stringify(await dataLayer(page))).not.toContain('player@example.com');
  });

  test('the confirmation page sends sign_up_confirmed', async ({ page }) => {
    await accepted(page);
    await page.goto('/beta/confirmed');
    await expect
      .poll(async () => (await dataLayer(page)).some((e) => e[1] === 'sign_up_confirmed'))
      .toBe(true);
  });

  test('nothing is sent without consent', async ({ page }) => {
    await watch(page);
    await page.goto('/beta/confirmed');
    await page.waitForTimeout(800);
    expect((await dataLayer(page)).filter((e) => e[0] === 'event')).toEqual([]);
  });
});

test.describe('feature flags', () => {
  const features = (payload: unknown) => ({
    status: 200,
    headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json' },
    body: JSON.stringify({ status: 200, features: payload }),
  });

  test('flipping join-beta-cta off in the feature payload removes the button, with no rebuild', async ({
    page,
  }) => {
    await watch(page);
    await page.route(GB_FEATURES, (r) =>
      r.fulfill(features({ 'join-beta-cta': { defaultValue: { on: false } } })),
    );
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Join the beta' })).toHaveCount(0, {
      timeout: 8_000,
    });
    await expect(page.locator('h1')).toBeVisible(); // the page itself is intact
  });

  test('with the flag on (or GrowthBook unreachable) the button stays', async ({ page }) => {
    await watch(page);
    await page.route(GB_FEATURES, (r) =>
      r.fulfill(features({ 'join-beta-cta': { defaultValue: { on: true } } })),
    );
    await page.goto('/');
    await page.waitForTimeout(1_500);
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Join the beta' }),
    ).toBeVisible();
  });
});

// The edge Worker serves a variant's prerendered page at the route's own URL (edge/experiments.ts). The
// preview server has no Worker, so these specs play its part: the variant file answers "/".
test.describe('experiment variant pages', () => {
  const VARIANT = 'The engine an AI builds games in, and proves.';
  const CONTROL = 'A game engine an AI can build in, and prove.';

  async function asEdge(page: Page) {
    await page.route('**/', async (route) => {
      if (route.request().resourceType() !== 'document') return route.fallback();
      const res = await route.fetch({ url: '/_variants/home-headline/variant-b/' });
      return route.fulfill({ response: res });
    });
  }

  test('a visitor who accepted sees the variant headline, hydrated without errors', async ({
    page,
  }) => {
    await watch(page);
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => localStorage.setItem('ps-consent', 'granted'));
    await asEdge(page);
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText(VARIANT);
    await page.waitForTimeout(1_000);
    await expect(page.locator('h1')).toHaveText(VARIANT);
    expect(errors.filter((e) => /hydrat|did not match|418|423/i.test(e))).toEqual([]);
  });

  test('a visitor without consent always ends on the control headline', async ({ page }) => {
    await watch(page);
    await page.addInitScript(() => localStorage.setItem('ps-consent', 'denied'));
    await asEdge(page);
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText(CONTROL);
  });

  test('the variant page is kept out of search results', async ({ page }) => {
    await page.goto('/_variants/home-headline/variant-b/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('meta[name="ps-variant"]')).toHaveAttribute(
      'content',
      'home-headline:variant-b',
    );
  });

  test('the control page is the default and carries no variant mark', async ({ page }) => {
    await watch(page);
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText(CONTROL);
    await expect(page.locator('meta[name="ps-variant"]')).toHaveCount(0);
  });
});
