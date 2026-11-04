import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Route } from '@playwright/test';

const OWNER = [
  'signups:read',
  'signups:export',
  'signups:delete',
  'broadcasts:read',
  'broadcasts:send',
  'users:manage',
];
const STAFF = ['signups:read', 'broadcasts:read'];

const me = (permissions: string[], role: string) => ({
  user: { id: 'user_1', email: 'founder@example.com' },
  organizationId: 'org_1',
  role,
  permissions,
});

interface Stub {
  signedIn: boolean;
  permissions: string[];
  role: string;
  calls: Array<{ method: string; path: string; body: unknown }>;
}

async function stubApi(page: Page, initial: Partial<Stub> = {}): Promise<Stub> {
  const s: Stub = { signedIn: false, permissions: OWNER, role: 'owner', calls: [], ...initial };
  await page.route('**/api/v1/**', async (route: Route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname.replace('/api/v1', '');
    const body = req.postData() ? JSON.parse(req.postData() as string) : undefined;
    s.calls.push({ method: req.method(), path, body });
    const json = (status: number, data: unknown) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    if (path === '/auth/me')
      return s.signedIn
        ? json(200, me(s.permissions, s.role))
        : json(401, { error: 'unauthenticated' });
    if (path === '/auth/code/send') return json(200, { ok: true });
    if (path === '/auth/code/verify') {
      if ((body as { code: string }).code !== '123456')
        return json(401, { error: 'invalid-credentials' });
      s.signedIn = true;
      return json(200, me(s.permissions, s.role));
    }
    if (path === '/auth/logout') {
      s.signedIn = false;
      return json(200, { ok: true });
    }
    if (path === '/admin/stats')
      return json(200, { total: 3, confirmed: 2, pending: 1, lastWeek: 3 });
    if (path === '/admin/signups')
      return json(200, {
        total: 3,
        page: 1,
        pageSize: 50,
        rows: [
          {
            email: 'ada@example.com',
            role: 'AI tools',
            created_at: '2026-11-03T10:00:00Z',
            confirmed_at: '2026-11-03T10:05:00Z',
          },
          {
            email: 'bob@example.com',
            role: null,
            created_at: '2026-11-02T10:00:00Z',
            confirmed_at: '2026-11-02T11:00:00Z',
          },
          {
            email: 'cy@example.com',
            role: 'Bevy projects',
            created_at: '2026-11-01T10:00:00Z',
            confirmed_at: null,
          },
        ],
      });
    if (path === '/admin/broadcasts' && req.method() === 'GET') return json(200, { rows: [] });
    if (path === '/admin/broadcasts' && req.method() === 'POST') return json(201, { id: 'b1' });
    if (path === '/admin/broadcasts/b1/test') return json(200, { sentTo: 'founder@example.com' });
    if (path === '/admin/broadcasts/b1/send') return json(202, { id: 'b1', total: 2 });
    return json(404, { error: 'not-found' });
  });
  return s;
}

async function signIn(page: Page) {
  await page.goto('/');
  await page.getByLabel('Email', { exact: true }).fill('founder@example.com');
  await page.getByRole('button', { name: 'Send code' }).click();
  await expect(page.getByRole('status')).toContainText('code is on its way');
  await page.getByLabel('6-digit code').fill('123456');
  await page.getByRole('button', { name: 'Verify code' }).click();
}

test('signs in with an email code and shows the owner console', async ({ page }) => {
  await stubApi(page);
  await signIn(page);
  await expect(page.getByRole('heading', { level: 1, name: 'Sign-ups' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Compose' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Export CSV' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete ada@example.com' })).toBeVisible();
  await expect(page.getByText('cy@example.com')).toBeVisible();
});

test('a wrong code gets one neutral message', async ({ page }) => {
  await stubApi(page);
  await page.goto('/');
  await page.getByLabel('Email', { exact: true }).fill('founder@example.com');
  await page.getByRole('button', { name: 'Send code' }).click();
  await page.getByLabel('6-digit code').fill('000000');
  await page.getByRole('button', { name: 'Verify code' }).click();
  await expect(page.getByRole('status')).toHaveText('That did not work. Check and try again.');
});

test('staff sees only what its permissions allow', async ({ page }) => {
  await stubApi(page, { signedIn: true, permissions: STAFF, role: 'staff' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Sign-ups' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Compose' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'History' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Export CSV' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Delete / })).toHaveCount(0);
});

test('send to all needs the typed confirmed count, and a test goes to me first', async ({
  page,
}) => {
  const s = await stubApi(page, { signedIn: true });
  await page.goto('/');
  await page.getByRole('button', { name: 'Compose' }).click();
  await page.getByLabel('Subject').fill('Version 1 is out');
  await page.getByLabel(/^Body/).fill('# Hello\n\nIt is **ready**.');
  await expect(page.locator('.mail-body h1')).toHaveText('Hello');
  await expect(page.locator('.mail-body strong')).toHaveText('ready');
  await page.getByRole('button', { name: 'Send test to me' }).click();
  await expect(page.getByRole('status')).toHaveText('Test sent to founder@example.com.');
  const send = page.getByRole('button', { name: 'Send to all confirmed' });
  await expect(send).toBeDisabled();
  await page.getByLabel('Recipient count').fill('3');
  await expect(send).toBeDisabled();
  await page.getByLabel('Recipient count').fill('2');
  await send.click();
  await expect(page.getByRole('status')).toContainText('Sending to 2 confirmed addresses');
  expect(s.calls.find((c) => c.path === '/admin/broadcasts/b1/send')?.body).toEqual({
    confirmCount: 2,
  });
});

test('signs out', async ({ page }) => {
  await stubApi(page, { signedIn: true });
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

test('no axe violations on sign-in and in the console', async ({ page }) => {
  await stubApi(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  const tags = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];
  expect((await new AxeBuilder({ page }).withTags(tags).analyze()).violations).toEqual([]);
  await signIn(page);
  await expect(page.getByText('ada@example.com')).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(tags).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Compose' }).click();
  expect((await new AxeBuilder({ page }).withTags(tags).analyze()).violations).toEqual([]);
});

test('no horizontal page overflow', async ({ page }) => {
  await stubApi(page);
  await page.goto('/');
  const over = () =>
    page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
  expect(await over()).toBe(0);
  await signIn(page);
  await expect(page.getByText('ada@example.com')).toBeVisible();
  expect(await over()).toBe(0);
});
