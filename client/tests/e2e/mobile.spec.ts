import { expect, test, type Page } from '@playwright/test';

// Phones: no horizontal overflow on any route at any scroll position, the header menu works by
// tap and keyboard, the sign-up succeeds by tap, and the boot lifts quickly.

async function overflowOffenders(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('body *')) {
      if (el.closest('svg') || el.closest('[data-scroller]')) continue;
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' || cs.display === 'none') continue;
      const b = el.getBoundingClientRect();
      if (b.width === 0) continue;
      // Content inside a horizontal scroller is allowed to be wider than the viewport.
      let p: HTMLElement | null = el.parentElement;
      let scroller = false;
      while (p && p !== document.body) {
        const o = getComputedStyle(p).overflowX;
        if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') {
          scroller = true;
          break;
        }
        p = p.parentElement;
      }
      if (scroller) continue;
      if (b.right > vw + 1 || b.left < -1) {
        out.push(
          `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ${Math.round(b.left)}..${Math.round(b.right)}`,
        );
      }
    }
    return out.slice(0, 10);
  });
}

async function assertNoOverflow(page: Page) {
  const { sw, vw } = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    vw: document.documentElement.clientWidth,
  }));
  expect(
    sw,
    `scrollWidth ${sw} > viewport ${vw}: ${(await overflowOffenders(page)).join(' | ')}`,
  ).toBeLessThanOrEqual(vw);
}

for (const route of ['/beta/', '/beta/privacy/', '/beta/confirmed/', '/beta/404.html']) {
  test(`no horizontal overflow on ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.waitForTimeout(route === '/beta/' ? 3200 : 600);
    await assertNoOverflow(page);
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height; y += 500) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(120);
      await assertNoOverflow(page);
    }
  });
}

test('the boot lifts within three seconds and the hero is readable', async ({ page }) => {
  await page.goto('/beta/');
  await expect(page.locator('html')).not.toHaveClass(/booting/, { timeout: 3000 });
  await expect(page.locator('h1')).toBeVisible();
  const box = await page.locator('h1').boundingBox();
  const header = await page.locator('header').boundingBox();
  expect(box && header && box.y >= header.y + header.height).toBe(true);
});

test('the header menu opens, lists the sections and navigates', async ({ page }) => {
  await page.goto('/beta/');
  await page.waitForTimeout(3200);
  const menu = page.getByRole('group').filter({ has: page.getByText('Menu') });
  const summary = page.locator('header summary');
  await expect(summary).toBeVisible();
  await summary.tap();
  const links = page.locator('header details nav a');
  await expect(links.first()).toBeVisible();
  expect(await links.count()).toBeGreaterThanOrEqual(5);
  await links.filter({ hasText: 'Roadmap' }).tap();
  await expect(page).toHaveURL(/#roadmap$/);
  await expect(page.locator('header details')).not.toHaveAttribute('open', '');
  void menu;
});

test('the header menu works from the keyboard', async ({ page }) => {
  await page.goto('/beta/');
  await page.waitForTimeout(3200);
  await page.locator('header summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('header details')).toHaveAttribute('open', '');
  await page.keyboard.press('Tab');
  await expect(page.locator('header details nav a').first()).toBeFocused();
});

test('the sign-up succeeds by tap', async ({ page }) => {
  await page.goto('/beta/#signup');
  await page.waitForTimeout(1500);
  const email = page.getByLabel('Email');
  await email.tap();
  await email.fill('player@example.com');
  expect(
    await email.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(16);
  await page.getByRole('button', { name: 'Request access' }).tap();
  const card = page.getByRole('status').filter({ hasText: 'Player 1 ready' });
  await expect(card).toBeVisible({ timeout: 5000 });
});

test('tap targets in the header are at least 44 px tall', async ({ page }) => {
  await page.goto('/beta/');
  await page.waitForTimeout(3200);
  for (const sel of ['header summary', 'header a[href*="signup"]']) {
    const box = await page.locator(sel).first().boundingBox();
    expect(box?.height ?? 0, sel).toBeGreaterThanOrEqual(44);
  }
});
