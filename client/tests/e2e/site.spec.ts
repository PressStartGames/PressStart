// The main site, layout L4 "Feature tour" (src/site/DESIGN.md): the tour on the home page, /engine,
// /engine/ai, the placeholder pages, the site-wide not-found page and the way into the beta. Runs on
// desktop and on a phone with reduced motion (playwright.config.ts).
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// The Discord invitation, read from the one place it is written (src/lib/config.ts).
const DISCORD_URL = /DISCORD_URL = '([^']+)'/.exec(
  readFileSync(new URL('../../src/lib/config.ts', import.meta.url), 'utf8'),
)?.[1];

const PAGES = [
  { path: '/engine/', h1: 'An engine written as documents.' },
  { path: '/engine/ai/', h1: 'Your own AI, through the player' },
  { path: '/engine/determinism/', h1: 'Same seed, same inputs, same game.' },
  { path: '/roadmap/', h1: 'The road, in order.' },
  { path: '/learn/', h1: 'Build a game.' },
  { path: '/privacy/', h1: 'Privacy.' },
];

const STAGES = [
  'documents',
  'determinism',
  'parallel',
  'goldens',
  'oracles',
  'ai',
  'ownership',
  'built',
  'road',
];

async function axe(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return results.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
}

// Scrolls the page through once so every in-view reveal has played, then waits for it to settle
// (axe measures contrast through opacity, so a reveal caught mid-fade would read as a failure).
async function revealAll(page: Page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(1600);
}

async function noOverflow(page: Page) {
  const { sw, vw } = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    vw: document.documentElement.clientWidth,
  }));
  expect(sw).toBeLessThanOrEqual(vw);
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

test('the tour: every stage is on the page, in the select screen and in the map', async ({
  page,
}) => {
  await page.goto('/');
  const select = page.getByRole('navigation', { name: 'The tour' });
  const map = page.getByRole('navigation', { name: 'Tour index' });
  for (const id of STAGES) {
    await expect(page.locator(`section#${id} h2`)).toHaveCount(1);
    await expect(select.locator(`a[href="#${id}"]`)).toHaveCount(1);
    await expect(map.locator(`a[href="#${id}"]`)).toHaveCount(1);
  }
  await select.locator('a[href="#goldens"]').click();
  await expect(page).toHaveURL(/#goldens$/);
  await expect(page.locator('#goldens')).toBeInViewport({ timeout: 10_000 });
});

// The road is direction only: three stops, no dates, no internal work (founder, 2026-11-05).
test('the road has three stops, now, next and then, on the home page and /roadmap', async ({
  page,
}) => {
  for (const [path, root] of [
    ['/', '#road'],
    ['/roadmap/', 'main'],
  ] as const) {
    await page.goto(path);
    const stops = page.locator(`${root} ol li`);
    await expect(stops).toHaveCount(3);
    await expect(stops.nth(0)).toContainText('Private beta');
    await expect(stops.nth(1)).toContainText('Version 1.');
    await expect(stops.nth(2)).toContainText('Version 1.x');
    await expect(page.locator('main')).not.toContainText(
      /licen[cs]e wave|repository split|rewrit|\bwaves?\b/i,
    );
  }
});

test('the footer links Discord from DISCORD_URL', async ({ page }) => {
  expect(DISCORD_URL).toMatch(/^https:\/\/discord\.gg\//);
  await page.goto('/');
  const discord = page.getByRole('contentinfo').getByRole('link', { name: /Discord/ });
  await expect(discord).toHaveAttribute('href', DISCORD_URL!);
});

test('the ledger breaks at tick 80 and mends', async ({ page }) => {
  await page.goto('/#determinism');
  const stage = page.locator('#determinism');
  await expect(stage.getByText('every line matches')).toBeVisible();
  await stage.getByRole('button', { name: 'Change one input at tick 80' }).click();
  await expect(stage.getByText('first difference at tick 80')).toBeVisible();
  await stage.getByRole('button', { name: 'Same inputs' }).click();
  await expect(stage.getByText('every line matches')).toBeVisible();
});

test('the core board re-deals and the checksum does not move', async ({ page }) => {
  await page.goto('/#parallel');
  const stage = page.locator('#parallel');
  const sum = stage.getByText(/^[0-9a-f]{16}$/).first();
  const before = await sum.textContent();
  await stage.getByRole('button', { name: '2 cores' }).click();
  await expect(stage.getByRole('button', { name: '2 cores' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(sum).toHaveText(before ?? '');
});

test('the console answers its four verbs', async ({ page }) => {
  await page.goto('/#ai');
  const stage = page.locator('#ai');
  await stage.getByRole('button', { name: /^control/ }).click();
  await expect(stage.getByText(/stepped to tick 144/)).toBeVisible();
  await stage.getByRole('button', { name: /^command/ }).click();
  await expect(stage.getByText(/journal #2/)).toBeVisible();
});

test('the home page has no axe violations and no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await revealAll(page);
  expect(await axe(page)).toEqual([]);
  await noOverflow(page);
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 700) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(60);
    await noOverflow(page);
  }
});

for (const p of PAGES) {
  test(`${p.path} is prerendered, titled, axe clean and fits the screen`, async ({ page }) => {
    await page.goto(p.path);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(p.h1);
    await expect(page.locator('h1')).toHaveCount(1);
    await revealAll(page);
    expect(await axe(page)).toEqual([]);
    await noOverflow(page);
  });
}

test('client navigation between site pages updates the title', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) await page.getByRole('banner').getByText('Menu').click();
  const nav = page.getByRole('navigation', { name: isMobile ? 'Menu' : 'Site', exact: true });
  await nav.getByRole('link', { name: 'Engine' }).click();
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

test('the main site renders without JavaScript, every proof in its final state', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const path of ['/', '/engine/', '/engine/ai/', '/community/']) {
    await page.goto(`${baseURL}${path}`);
    await expect(page.locator('h1')).toBeVisible();
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  }
  await page.goto(`${baseURL}/`);
  // Final states: the ledger passes, the verbatim request shows beside its picture, the bars show.
  await expect(page.getByText('every line matches')).toBeVisible();
  await expect(page.locator('#documents pre')).toBeVisible();
  await expect(page.locator('#built [role="img"]').first()).toBeVisible();
  await context.close();
});

test('sets no cookie', async ({ page, context }) => {
  await page.goto('/');
  await page.goto('/engine/');
  await page.waitForTimeout(300);
  expect(await context.cookies()).toEqual([]);
});
