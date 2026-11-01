import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import replay from '../../data/replay.json' with { type: 'json' };

const LAST = String(replay.ticks).padStart(3, '0');
const MATCH = `${replay.rows.length}/${replay.rows.length} checksums match`;

test('the home page reads: one h1, landmarks, the fixed CTA, the honest line', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('A game engine an AI can build in');
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('banner').getByRole('link', { name: 'Join the beta' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Where we are, honestly.' })).toBeAttached();
  await expect(page.getByText('Private beta. Version 1 is not public yet.')).toBeVisible();
});

test('the replay strip reaches tick 128 and stamps PASS', async ({ page }) => {
  await page.goto('/');
  const strip = page.locator('figure').first();
  await expect(strip.locator('b').first()).toHaveText(LAST, { timeout: 10_000 });
  await expect(strip.getByText(MATCH)).toBeVisible();
});

test('the number tiles show the synced counts', async ({ page }) => {
  await page.goto('/#built');
  const built = page.locator('#built');
  await expect(built.getByText('entries in the catalog')).toBeVisible();
  await expect(built.getByText(/synced \d{4}-\d{2}-\d{2} · engine [0-9a-f]{7}/)).toBeVisible();
});

test('the skip link, nav anchors and the FAQ work from the keyboard', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  const q = page.getByText('Is it open source?');
  await q.scrollIntoViewIfNeeded();
  await q.click();
  await expect(page.getByText('It will be source-available.')).toBeVisible();
});

test('has no axe violations', async ({ page }) => {
  await page.goto('/');
  // Let the load sequence finish so the page is in its settled state.
  await expect(page.getByText(MATCH)).toBeVisible({ timeout: 10_000 });
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const summary = results.violations.map((v) => ({
    id: v.id,
    nodes: v.nodes.map((n) => ({
      target: n.target,
      message: n.any[0]?.message ?? n.all[0]?.message,
    })),
  }));
  expect(summary).toEqual([]);
});

test('the privacy and not-found routes are prerendered', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy.' })).toBeVisible();
  const res = await page.goto('/404.html');
  expect(res?.ok()).toBe(true);
  await expect(page.getByRole('heading', { level: 1, name: 'Tick not found.' })).toBeVisible();
});

test('renders without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/`);
  await expect(page.locator('h1')).toBeVisible();
  const h2 = page.getByRole('heading', { name: 'What is built today, counted.' });
  await h2.scrollIntoViewIfNeeded();
  await expect(h2).toBeVisible();
  expect(await h2.evaluate((el) => getComputedStyle(el.parentElement!).opacity)).toBe('1');
  await expect(page.getByText(MATCH)).toBeAttached();
  await context.close();
});

test('sets no cookie', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForTimeout(500);
  expect(await context.cookies()).toEqual([]);
});
