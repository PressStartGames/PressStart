import { expect, test } from '@playwright/test';

test('with only a fallback URL the sign-up is a plain HTML form posting to the form service', async ({
  page,
}) => {
  await page.goto('/beta/#signup');
  const form = page.locator('#signup form');
  await expect(form).toHaveAttribute('action', 'https://example.com/form');
  await expect(form).toHaveAttribute('method', 'post');
  await expect(form.getByLabel('Email')).toHaveAttribute('name', 'email_address');
  await expect(form.getByLabel('What do you build? (optional)')).toBeVisible();
  await expect(form.getByRole('button', { name: 'Request access' })).toBeVisible();
});
