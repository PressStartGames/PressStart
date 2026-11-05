import { expect, test } from '@playwright/test';

test('with no endpoint configured the sign-up is a static coming-soon card, no form, no dead button', async ({
  page,
}) => {
  await page.goto('/beta/#signup');
  const block = page.locator('#signup');
  await expect(block.getByText('Sign-ups open soon.')).toBeVisible();
  await expect(block.locator('form')).toHaveCount(0);
  await expect(block.getByRole('button')).toHaveCount(0);
  await expect(block.getByRole('link', { name: 'Privacy' })).toBeVisible();
});
