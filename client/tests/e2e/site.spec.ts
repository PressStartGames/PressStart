// The main site (layout L3, "Community engine"; client/src/site/DESIGN.md): the home page, the designed
// pages (/engine, /engine/parallel, /roadmap, /news), the placeholders, the site-wide not-found page,
// and the way into the beta. Runs on desktop and on a phone with reduced motion (playwright.config.ts).
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import counts from '../../data/counts.json' with { type: 'json' };
import { readFileSync } from 'node:fs';

// The Discord invite as lib/config.ts defines it (read, not retyped; config.ts needs Vite's env).
const DISCORD_URL =
  /DISCORD_URL = '([^']+)'/.exec(
    readFileSync(new URL('../../src/lib/config.ts', import.meta.url), 'utf8'),
  )?.[1] ?? 'DISCORD_URL missing from lib/config.ts';

const PAGES = [
  { path: '/engine/', h1: 'An engine written as documents.' },
  { path: '/engine/parallel/', h1: 'All your cores, the same answer.' },
  { path: '/engine/determinism/', h1: 'Same seed, same inputs, same game.' },
  { path: '/roadmap/', h1: 'The road, in order.' },
  { path: '/news/', h1: 'News.' },
  { path: '/community/', h1: 'Come build with us.' },
  { path: '/privacy/', h1: 'Privacy.' },
];

async function axe(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return results.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
}

// Scrolls the whole page (so reveals and scroll-triggered motion run) and checks nothing is wider
// than the viewport at any point.
async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(80);
    const { sw, vw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      vw: document.documentElement.clientWidth,
    }));
    expect(sw, `horizontal overflow at y=${y}`).toBeLessThanOrEqual(vw);
  }
}

// The header nav is a <details> menu on a phone.
async function siteNav(page: Page) {
  const menu = page.getByRole('banner').locator('summary');
  if (await menu.isVisible()) await menu.click();
  return page.getByRole('navigation', { name: 'Site' }).filter({ visible: true });
}

test('the home page reads: one h1, landmarks, the way into the beta', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('A game engine an AI can build in');
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page).toHaveTitle(/Press Start/);
  for (const name of ['Where we are.', 'Come build with us.', 'Press Start']) {
    await expect(page.getByRole('heading', { level: 2, name })).toBeAttached();
  }
  expect(errors, 'no hydration or runtime errors').toEqual([]);
  const join = page.getByRole('banner').getByRole('link', { name: 'Join the beta' });
  await expect(join).toHaveAttribute('href', '/beta/');
  await join.click();
  await expect(page).toHaveURL(/\/beta\/$/);
  await expect(page.locator('h1')).toContainText('A game engine an AI can build in');
  await expect(page.getByRole('heading', { name: 'Where we are.' })).toBeAttached();
});

test('the four value buttons lead to their strength pages', async ({ page }) => {
  await page.goto('/');
  const values = page.getByRole('region', { name: 'Four things nobody else ships' });
  await expect(values.getByRole('link')).toHaveCount(4);
  await values.getByRole('link', { name: /All cores/ }).click();
  await expect(page).toHaveURL(/\/engine\/parallel$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'All your cores, the same answer.',
  );
});

test('the handheld replays the same seed onto the same checksum, and SELECT changes the game', async ({
  page,
}) => {
  await page.goto('/');
  const status = page.locator('figure [role="status"]');
  const start = page.getByRole('button', { name: /^Start/ });
  const select = page.getByRole('button', { name: /^Select/ });
  await expect(status).toContainText('Run 1 recorded', { timeout: 15_000 });
  await expect(start).toBeEnabled({ timeout: 15_000 });
  await start.click();
  await expect(status).toContainText('Same checksum as run 1', { timeout: 15_000 });
  await expect(select).toBeEnabled({ timeout: 15_000 });
  await select.click();
  await expect(status).toContainText('New seed, new game', { timeout: 15_000 });
});

test('the high scores show the synced counts', async ({ page }) => {
  await page.goto('/');
  const board = page.locator('table').filter({ hasText: 'engine crates' });
  await board.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  await expect(board).toContainText(String(counts.crates));
  await expect(board).toContainText(String(counts.catalog.built));
  await expect(board).toContainText(String(counts.catalog.partial));
});

for (const p of PAGES) {
  test(`${p.path} is prerendered, titled and axe clean`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(p.path);
    await expect(page.getByRole('heading', { level: 1, name: p.h1 })).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await scrollThrough(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    expect(await axe(page)).toEqual([]);
  });
}

test('the home page has no axe violations and no horizontal overflow', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await page.waitForTimeout(600);
  await scrollThrough(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  expect(await axe(page)).toEqual([]);
});

test('client navigation between site pages updates the title', async ({ page }) => {
  await page.goto('/');
  await (await siteNav(page)).getByRole('link', { name: 'Engine' }).click();
  await expect(page).toHaveURL(/\/engine$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'An engine written as documents.',
  );
  await expect(page).toHaveTitle('The engine · Press Start');
});

test('the footer links Discord and every page group', async ({ page }) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  await expect(footer.getByRole('link', { name: 'Discord' })).toHaveAttribute('href', DISCORD_URL);
  await expect(footer.getByRole('link', { name: 'All cores' })).toHaveAttribute(
    'href',
    '/engine/parallel',
  );
  await expect(footer.getByRole('link', { name: 'Join the beta' })).toHaveAttribute(
    'href',
    '/beta/',
  );
  // Get involved carries Discord too.
  await expect(page.getByRole('link', { name: /Say hello on Discord/ })).toHaveAttribute(
    'href',
    DISCORD_URL,
  );
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

test('the main site renders without JavaScript, in its final state', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const path of ['/', '/engine/', '/engine/parallel/', '/roadmap/', '/community/']) {
    await page.goto(`${baseURL}${path}`);
    await expect(page.locator('h1')).toBeVisible();
    // Styled: the console's chassis background comes from the area's stylesheet.
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  }
  await page.goto(`${baseURL}/`);
  // The handheld's final frame and verdict, the road's stages, the counts: all there without JS.
  await expect(page.locator('figure [role="status"]')).toContainText('Run 1 recorded');
  await expect(page.getByText('You are here', { exact: false })).toBeVisible();
  await expect(page.locator('table')).toContainText('engine crates');
  await page.goto(`${baseURL}/engine/parallel/`);
  await expect(page.getByText('not equal')).toBeVisible();
  // The phone menu is a <details>: it opens without JavaScript.
  await context.close();
});

test('sets no cookie', async ({ page, context }) => {
  await page.goto('/');
  await page.goto('/engine/');
  await page.waitForTimeout(300);
  expect(await context.cookies()).toEqual([]);
});
