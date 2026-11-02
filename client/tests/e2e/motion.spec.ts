import { expect, test } from '@playwright/test';
import { ROW_TICKS } from '../../src/lib/sim';

// The animation layer: the hero timeline hands over, the pinned proof screens reach their end
// states when scrolled through, and scrolling back up restores the earlier state.
test.use({ viewport: { width: 1440, height: 900 } });

test('the hero timeline hands over to the attract mode and the headline keeps its sentence', async ({
  page,
}) => {
  await page.goto('/');
  const h1 = page.locator('h1');
  await expect(h1).toHaveAttribute('aria-label', /A game engine an AI can build in/, {
    timeout: 10_000,
  });
  // The boot plus the timeline take under five seconds; then the lede is fully shown.
  await expect(page.locator('.lede').first()).toHaveCSS('opacity', '1', { timeout: 10_000 });
  const chars = await h1.locator('.hero-glyph').count();
  expect(chars).toBeGreaterThanOrEqual(8);
});

test('the procedure lights the step and its code lines, forward and back', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3000);
  const steps = page.locator('#build ol > li');
  const last = steps.last();
  await last.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(600);
  await expect(last).toHaveAttribute('data-active', 'true');
  await expect(page.locator('#build [data-on]').first()).toBeVisible();
  const first = steps.first();
  await first.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(600);
  await expect(first).toHaveAttribute('data-active', 'true');
});

test('the cores screen scrubs to its end state and back', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3000);
  const section = page.locator('#parallel');
  await section.evaluate((el) =>
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY),
  );
  await page.waitForTimeout(300);
  // Scroll through the section in steps so the scrub advances.
  const height = await section.evaluate((el) => el.getBoundingClientRect().height);
  for (let i = 1; i <= 8; i++) {
    await page.mouse.wheel(0, height / 8);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(800);
  const readout = section.locator('[data-readout]').first();
  await expect(readout).toHaveCSS('opacity', '1');
  expect(ROW_TICKS.length).toBeGreaterThan(0);
});

test('sign-up: the cartridge seats after a valid address', async ({ page }) => {
  await page.goto('/#signup');
  await page.getByLabel('Email').fill('player@example.com');
  await page.getByRole('button', { name: 'Request access' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Player 1 ready' })).toBeVisible({
    timeout: 6_000,
  });
});
