// The main site's routing skeleton (plans/main-site.md phase 1): the placeholder home, the stub pages,
// the site-wide not-found page, and the way into the beta. Runs on desktop and on a phone with reduced
// motion (playwright.config.ts).
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const STUBS = [
  { path: '/engine/', h1: 'An engine written as documents.' },
  { path: '/engine/determinism/', h1: 'Same seed, same inputs, same game.' },
  { path: '/roadmap/', h1: 'The road, in order.' },
  { path: '/privacy/', h1: 'Privacy.' },
];

async function axe(page: Page) {
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
  await page.goto('/');
  await page.waitForTimeout(600);
  expect(await axe(page)).toEqual([]);
});

test('client navigation between site pages updates the title', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Site' })
    .getByRole('link', { name: 'Engine' })
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
