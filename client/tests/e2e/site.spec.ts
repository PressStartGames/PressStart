// The main site (layout L2 "Platform suite", src/site/DESIGN.md): the home page, the designed /engine and
// /engine/oracles, the placeholder pages, the mega-menu and the phone drawer, the footer, the way into
// the beta. Runs on desktop (motion on) and on a phone with reduced motion (playwright.config.ts).
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

// The Discord link, read from its one definition (lib/config.ts reads import.meta.env, so it is not
// imported into Node).
const DISCORD_URL =
  /DISCORD_URL = '([^']+)'/.exec(
    readFileSync(new URL('../../src/lib/config.ts', import.meta.url), 'utf8'),
  )?.[1] ?? 'missing';

const PAGES = [
  { path: '/engine/', h1: 'Built around Bevy, written as documents.' },
  { path: '/engine/oracles/', h1: 'Measured against a reference.' },
  { path: '/engine/determinism/', h1: 'Same seed, same inputs, same game.' },
  { path: '/roadmap/', h1: 'The road, in order.' },
  { path: '/community/', h1: 'Come build with us.' },
  { path: '/privacy/', h1: 'Privacy.' },
];

const isPhone = () => test.info().project.name.includes('mobile');

async function axe(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return results.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
}

// Scrolls the whole page (so every reveal settles) and back to the top.
async function scrollThrough(page: Page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
}

test('the home page reads: one h1, landmarks, the three moves, the way into the beta', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('A game engine an AI can build in');
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page).toHaveTitle(/Press Start/);
  for (const name of [
    'Everything is a document. The game answers back.',
    'Tests, not eyes.',
    'The game is your code.',
  ]) {
    await expect(page.getByRole('heading', { level: 2, name })).toBeAttached();
  }
  if (!isPhone()) {
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Join the beta' }),
    ).toHaveAttribute('href', '/beta/');
  }
  const join = page.getByRole('main').getByRole('link', { name: 'Join the beta' }).first();
  await expect(join).toHaveAttribute('href', '/beta/');
  await join.click();
  await expect(page).toHaveURL(/\/beta\/$/);
  await expect(page.locator('h1')).toContainText('A game engine an AI can build in');
  await expect(page.getByRole('heading', { name: 'Where we are, honestly.' })).toBeAttached();
});

test('the suite console proves, then fails on another seed', async ({ page }) => {
  await page.goto('/');
  const console_ = page.getByRole('figure', { name: /Drawn in your browser/ });
  await expect(console_.getByRole('row')).toHaveCount(8);
  await expect(console_.getByText('replay exact · every tick matches')).toBeVisible({
    timeout: 10_000,
  });
  await console_.getByRole('button', { name: 'Try another seed' }).click();
  await expect(console_.getByRole('button', { name: 'Try another seed' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(console_.getByText('another seed · the runs part at once')).toBeVisible({
    timeout: 10_000,
  });
  await expect(console_.getByText('FAIL').first()).toBeVisible();
});

for (const p of PAGES) {
  test(`${p.path} is prerendered, titled and axe clean`, async ({ page }) => {
    await page.goto(p.path);
    await expect(page.getByRole('heading', { level: 1, name: p.h1 })).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await scrollThrough(page);
    expect(await axe(page)).toEqual([]);
  });
}

test('the home page has no axe violations', async ({ page }) => {
  await page.goto('/');
  await scrollThrough(page);
  expect(await axe(page)).toEqual([]);
});

test('the footer links Discord and the whole site map', async ({ page }) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  await expect(footer.getByRole('link', { name: /Discord/ })).toHaveAttribute('href', DISCORD_URL);
  const map = footer.getByRole('navigation', { name: 'Site map' });
  await expect(map.getByRole('link', { name: 'Oracles' })).toHaveAttribute(
    'href',
    '/engine/oracles',
  );
  await page.goto('/community/');
  await expect(page.getByRole('main').getByRole('link', { name: /Discord/ })).toHaveAttribute(
    'href',
    DISCORD_URL,
  );
});

test('the mega-menu works by keyboard: open, arrows, Escape, focus returns', async ({ page }) => {
  test.skip(isPhone(), 'the phone has the drawer instead');
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Site' });
  const engine = nav.getByRole('button', { name: 'Engine' });
  await expect(engine).toHaveAttribute('aria-expanded', 'false');
  await engine.focus();
  await page.keyboard.press('ArrowDown');
  await expect(engine).toHaveAttribute('aria-expanded', 'true');
  const overview = nav.getByRole('link', { name: /^The engine/ });
  await expect(overview).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(nav.getByRole('link', { name: /The AI surface/ })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(engine).toHaveAttribute('aria-expanded', 'false');
  await expect(engine).toBeFocused();
  await expect(overview).toBeHidden();
  await page.keyboard.press('ArrowRight');
  const resources = nav.getByRole('button', { name: 'Resources' });
  await expect(resources).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(resources).toHaveAttribute('aria-expanded', 'true');
  await expect(nav.getByRole('link', { name: /Roadmap/ })).toBeVisible();
  expect(await axe(page)).toEqual([]);
  // A click outside closes it.
  await page.mouse.click(700, 800);
  await expect(resources).toHaveAttribute('aria-expanded', 'false');
});

test('client navigation through the menu updates the title and lands on the page', async ({
  page,
}) => {
  await page.goto('/');
  if (isPhone()) {
    await page.getByRole('button', { name: 'Menu' }).click();
    await page
      .getByRole('dialog', { name: 'Menu' })
      .getByRole('link', { name: /Oracles/ })
      .click();
  } else {
    const nav = page.getByRole('navigation', { name: 'Site' });
    await nav.getByRole('button', { name: 'Engine' }).click();
    await nav.getByRole('link', { name: /Oracles/ }).click();
  }
  await expect(page).toHaveURL(/\/engine\/oracles$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Measured against a reference.');
  await expect(page).toHaveTitle('Oracles · Press Start');
});

test('the phone drawer: modal, focus moves in and is trapped, Escape returns focus', async ({
  page,
}) => {
  test.skip(!isPhone(), 'the desktop has the mega-menu');
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.click();
  const dialog = page.getByRole('dialog', { name: 'Menu' });
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole('button', { name: 'Close menu' });
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('link', { name: 'Join the beta' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  expect(await axe(page)).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(menu).toBeFocused();
});

test('no horizontal overflow on a phone', async ({ page }) => {
  test.skip(!isPhone(), 'phone only');
  for (const path of ['/', '/engine/', '/engine/oracles/', '/learn/']) {
    await page.goto(path);
    await scrollThrough(page);
    const { sw, vw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      vw: document.documentElement.clientWidth,
    }));
    expect(sw, path).toBeLessThanOrEqual(vw);
  }
});

test('reduced motion shows the final state at once', async ({ page }) => {
  test.skip(!isPhone(), 'the phone project runs with reduced motion');
  await page.goto('/');
  const console_ = page.getByRole('figure', { name: /Drawn in your browser/ });
  await expect(console_.getByText('replay exact · every tick matches')).toBeVisible();
  const cell = console_.getByRole('cell', { name: '240' });
  expect(await cell.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  const card = page.locator('[data-reveal]').first();
  expect(await card.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
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
  for (const path of ['/', '/engine/', '/engine/oracles/', '/community/']) {
    await page.goto(`${baseURL}${path}`);
    await expect(page.locator('h1')).toBeVisible();
    // Styled: the console's chassis background comes from the area's stylesheet.
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    // Nothing waits for JavaScript to appear.
    const hidden = await page.evaluate(
      () =>
        [...document.querySelectorAll('[data-reveal], tbody tr')].filter(
          (el) => getComputedStyle(el).opacity !== '1',
        ).length,
    );
    expect(hidden, path).toBe(0);
  }
  // The menu still opens without JavaScript (hover/focus), and its links are real links.
  if (isPhone()) {
    await context.close();
    return;
  }
  await page.goto(`${baseURL}/`);
  await page
    .getByRole('navigation', { name: 'Site' })
    .getByRole('button', { name: 'Engine' })
    .focus();
  await expect(page.getByRole('link', { name: /Determinism/ }).first()).toBeVisible();
  await context.close();
});

test('sets no cookie', async ({ page, context }) => {
  await page.goto('/');
  await page.goto('/engine/');
  await page.waitForTimeout(300);
  expect(await context.cookies()).toEqual([]);
});
