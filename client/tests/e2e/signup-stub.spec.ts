import { expect, test } from '@playwright/test';

test.describe('sign-up (stub endpoint)', () => {
  test('a valid address flips the card to Player 1 ready', async ({ page }) => {
    await page.goto('/#signup');
    await page.getByLabel('Email').fill('player@example.com');
    await page.getByRole('button', { name: 'Request access' }).click();
    const card = page.getByRole('status').filter({ hasText: 'Player 1 ready' });
    await expect(card).toBeVisible({ timeout: 5_000 });
    await expect(card).toContainText('Check your inbox to confirm.');
    await expect(card).toBeFocused();
  });

  test('an invalid address is refused on the client', async ({ page }) => {
    await page.goto('/#signup');
    await page.getByLabel('Email').fill('not-an-address');
    await page.getByRole('button', { name: 'Request access' }).click();
    await expect(page.getByRole('status')).toHaveText('That address does not look right.');
    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('an existing address and a server failure show their lines', async ({ page }) => {
    await page.goto('/#signup');
    await page.getByLabel('Email').fill('existing@example.com');
    await page.getByRole('button', { name: 'Request access' }).click();
    await expect(page.getByRole('status')).toHaveText('You are already on the list.', {
      timeout: 5_000,
    });

    await page.getByLabel('Email').fill('fail@example.com');
    await page.getByRole('button', { name: 'Request access' }).click();
    await expect(page.getByRole('status')).toHaveText('Something failed on our side. Try again.', {
      timeout: 5_000,
    });
  });

  test('the honeypot is not reachable by a person', async ({ page }) => {
    await page.goto('/#signup');
    const honeypot = page.locator('input[name="website"]');
    await expect(honeypot).toBeAttached();
    expect(await honeypot.getAttribute('tabindex')).toBe('-1');
    expect(await honeypot.evaluate((el) => el.closest('[aria-hidden="true"]') !== null)).toBe(true);
    // Tabbing from the role field lands on the submit button, never on the honeypot.
    await page.getByLabel('What do you build? (optional)').focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Request access' })).toBeFocused();
  });
});
