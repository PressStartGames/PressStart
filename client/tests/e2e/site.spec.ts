// The main site (layout L1 "Cinematic", client/src/site/DESIGN.md): the home page's acts, the designed
// pages (/engine, /engine/determinism), the styled placeholders, the site-wide not-found page and the
// way into the beta. Runs on desktop and on a phone with reduced motion (playwright.config.ts).
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

// The Discord link's one source is lib/config.ts (it reads import.meta.env, so it is read as text here).
const DISCORD_URL =
  /DISCORD_URL = '([^']+)'/.exec(
    readFileSync(new URL('../../src/lib/config.ts', import.meta.url), 'utf8'),
  )?.[1] ?? 'missing';
import { expect, test, type Page } from '@playwright/test';

const STUBS = [
  { path: '/engine/', h1: 'An engine written as documents.' },
  { path: '/engine/determinism/', h1: 'Same seed, same inputs, same game.' },
  { path: '/engine/parallel/', h1: 'All your cores, the same answer.' },
  { path: '/roadmap/', h1: 'The road, in order.' },
  { path: '/showcase/', h1: 'Made with Press Start.' },
  { path: '/privacy/', h1: 'Privacy.' },
];
const PAGES = ['/', ...STUBS.map((s) => s.path), '/community/', '/404.html'];

// Scroll through the page first, so every reveal has played (axe blends a fading element's colour).
async function axe(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  // Let the scrubs catch up with the scroll and the last reveals finish, even on a busy machine.
  await page.waitForTimeout(2500);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return results.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
}

test('the home page reads: one h1, landmarks, the way into the beta', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('A game engine an AI can build in');
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page).toHaveTitle(/Press Start/);
  const join = page.getByRole('banner').getByRole('link', { name: 'Join the beta' });
  await expect(join).toHaveAttribute('href', '/beta/');
  await join.click();
  await expect(page).toHaveURL(/\/beta\/$/);
  await expect(page.locator('h1')).toContainText('A game engine an AI can build in');
  await expect(page.getByRole('heading', { name: 'Where we are.' })).toBeAttached();
});

for (const stub of STUBS) {
  test(`${stub.path} is prerendered, titled and axe clean`, async ({ page }) => {
    await page.goto(stub.path);
    await expect(page.getByRole('heading', { level: 1, name: stub.h1 })).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await axe(page)).toEqual([]);
  });
}

test('the home page has no axe violations', async ({ page }) => {
  // The home page is long (sticky stages), and axe walks all of it.
  test.setTimeout(90_000);
  await page.goto('/');
  await page.waitForTimeout(600);
  expect(await axe(page)).toEqual([]);
});

test('client navigation between site pages updates the title', async ({ page }) => {
  await page.goto('/');
  // On a phone the pages fold into the menu.
  const menu = page.getByRole('banner').getByText('Menu', { exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole('navigation', { name: /^Site/ })
    .filter({ visible: true })
    .getByRole('link', { name: 'Engine', exact: true })
    .click();
  await expect(page).toHaveURL(/\/engine$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'An engine written as documents.',
  );
  await expect(page).toHaveTitle('The engine · Press Start');
});

test('the site-wide and the beta not-found pages are prerendered', async ({ page }) => {
  let res = await page.goto('/404.html');
  expect(res?.ok()).toBe(true);
  await expect(page.getByRole('heading', { level: 1, name: 'Tick not found.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to the start' })).toHaveAttribute('href', '/');
  res = await page.goto('/beta/404.html');
  expect(res?.ok()).toBe(true);
  await expect(page.getByRole('link', { name: 'Back to the site' })).toHaveAttribute(
    'href',
    '/beta/',
  );
});

test('the beta header points into the beta from its sub-pages', async ({ page }) => {
  await page.goto('/beta/privacy/');
  await expect(
    page.getByRole('banner').getByRole('link', { name: 'Join the beta' }),
  ).toHaveAttribute('href', '/beta/#signup');
  await expect(page.getByRole('link', { name: 'Press Start, home' })).toHaveAttribute(
    'href',
    '/beta/',
  );
});

test('the main site renders without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const path of ['/', '/engine/', '/community/']) {
    await page.goto(`${baseURL}${path}`);
    await expect(page.locator('h1')).toBeVisible();
    // Styled: the console's chassis background comes from the area's stylesheet.
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  }
  await context.close();
});

test('sets no cookie', async ({ page, context }) => {
  await page.goto('/');
  await page.goto('/engine/');
  await page.waitForTimeout(300);
  expect(await context.cookies()).toEqual([]);
});

test('the home page plays its acts: four ways in, four strengths, the film, the numbers', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 2, name: 'One engine. Four ways in.' }),
  ).toBeAttached();
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(4);
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('Build with an agent');
  await page.keyboard.press('End');
  await expect(tabs.nth(3)).toHaveAttribute('aria-selected', 'true');
  for (const h of [
    'Same seed, same inputs, same game.',
    'All your cores, the same answer.',
    'Held against the tools you already trust.',
    'The game is your code.',
  ]) {
    await expect(page.getByRole('heading', { level: 3, name: h })).toBeAttached();
  }
  await expect(
    page.getByRole('region', { name: "Accepted goldens from the engine's tests" }),
  ).toBeAttached();
  await expect(page.getByRole('img', { name: /accepted golden/ }).first()).toBeAttached();
  await expect(page.getByText('engine crates', { exact: true })).toBeAttached();
  await expect(page.getByRole('heading', { name: 'The road, in order. No dates.' })).toBeAttached();
});

// The road is direction only (founder, 2026-11-05): three stops, a line each, no internal work.
const ROAD = ['Private beta', 'Version 1', 'Version 1.x'];
const INTERNAL = /licen[cs]e (wave|work)|\bwaves?\b|rewrit|repo(sitory)? split|editor|stage \d/i;

test('the road has three stops, private beta lit as now, and names no internal work', async ({
  page,
}) => {
  await page.goto('/');
  const road = page.locator('ol').filter({ hasText: 'Private beta' });
  const stops = road.locator('li');
  await expect(stops).toHaveCount(3);
  for (const [i, name] of ROAD.entries()) await expect(stops.nth(i)).toContainText(name);
  await expect(stops.nth(0)).toHaveAttribute('data-now', 'true');
  for (const path of ['/', '/engine/', '/roadmap/']) {
    await page.goto(path);
    expect(await page.locator('main').innerText()).not.toMatch(INTERNAL);
  }
  await page.goto('/roadmap/');
  for (const stop of ['Now: private beta.', 'Next: version 1.', 'Then: version 1.x.']) {
    await expect(page.getByText(stop, { exact: true })).toBeAttached();
  }
  await page.goto('/engine/');
  await expect(page.getByRole('heading', { name: 'The road, in order. No dates.' })).toBeAttached();
  await expect(page.locator('li').filter({ hasText: /^Now, private beta:/ })).toHaveCount(1);
});

test('the determinism lab scrubs the run and names the first differing tick', async ({ page }) => {
  await page.goto('/engine/determinism/');
  const slider = page.getByRole('slider', { name: /Tick/ });
  await expect(slider).toHaveValue('240');
  await page.getByRole('button', { name: '140', exact: true }).click();
  await expect(slider).toHaveValue('140');
  await slider.fill('100');
  await expect(slider).toHaveValue('100');
  await expect(page.locator('dl').getByText(/run C · same/)).toBeVisible();
  await slider.fill('200');
  await expect(page.locator('dl').getByText(/run C · differs/)).toBeVisible();
  expect(await axe(page)).toEqual([]);
});

test('every main-site page renders without horizontal overflow', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(over, path).toBeLessThanOrEqual(0);
  }
});

test('reduced motion and no JavaScript show the final state', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${baseURL}/`);
  await page.waitForTimeout(400);
  // Reveals are shown at once, and the replay holds its finished run.
  const hidden = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll('.rv')).filter(
        (el) => getComputedStyle(el).opacity !== '1',
      ).length,
  );
  expect(hidden).toBe(0);
  await expect(page.locator('#home-title')).toBeVisible();
  await expect(page.getByText('7/7')).toBeVisible();
  await context.close();

  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const p2 = await noJs.newPage();
  await p2.goto(`${baseURL}/`);
  // Without JavaScript the tablist is hidden and every audience reads in order.
  await expect(p2.getByRole('tabpanel')).toHaveCount(4);
  await expect(p2.getByRole('tablist')).toBeHidden();
  await p2.goto(`${baseURL}/engine/determinism/`);
  await expect(p2.getByRole('button', { name: '140', exact: true })).toBeVisible();
  await noJs.close();
});

test('the footer and the community page link to Discord', async ({ page }) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  await expect(footer.getByRole('link', { name: /Discord/ })).toHaveAttribute('href', DISCORD_URL);
  await page.goto('/community/');
  await expect(page.getByRole('main').getByRole('link', { name: 'Discord' })).toHaveAttribute(
    'href',
    DISCORD_URL,
  );
});
