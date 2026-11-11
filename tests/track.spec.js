import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5173';

test('customers can find an order, read its next step and refresh progress', async ({ page }) => {
  let status = 'received';
  let shouldFail = false;
  const order = () => ({
    order_code: 'PI-123456',
    status,
    payment_status: 'paid',
    fulfilment: 'pickup',
    total: 56,
    customer_name: 'Guest',
    estimated_minutes: 20,
    created_at: '2026-11-11T12:00:00.000Z',
    items: [{ quantity: 1, name: 'Flat white', subtotal: 56 }],
    history: [],
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/rest/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const isTrackingRequest = url.pathname.endsWith('/rpc/track_order');
    const failed = isTrackingRequest && route.request().method() === 'POST' && shouldFail;
    const body = isTrackingRequest
      ? (route.request().method() === 'OPTIONS' ? '' : order())
      : [];
    await route.fulfill({
      status: failed ? 500 : 200,
      contentType: 'application/json',
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-headers': 'apikey,authorization,content-type,x-client-info,prefer',
        'access-control-allow-methods': 'GET,POST,OPTIONS',
      },
      body: failed ? JSON.stringify({ message: 'Temporary test failure' }) : (typeof body === 'string' ? body : JSON.stringify(body)),
    });
  });

  await page.goto(`${BASE}/track`);
  await expect(page.getByRole('heading', { name: 'Track your order' })).toBeVisible();
  await expect(page.locator('.track-illustration')).toBeVisible();
  await page.getByLabel('Order code').fill('PI-123456');
  await page.getByLabel('Phone number').fill('0241234567');
  await page.getByRole('button', { name: 'Track my order' }).click();

  await expect(page).toHaveURL(/\/track\/PI-123456$/);
  await expect(page.getByText('We have received your order. The cafe team will confirm it shortly.')).toBeVisible();
  await expect(page.locator('.track-last-checked')).toContainText('Last checked');

  status = 'preparing';
  shouldFail = true;
  await page.getByRole('button', { name: 'Refresh status' }).click();
  await expect(page.getByText('We could not refresh your order. Please try again.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Order PI-123456' })).toBeVisible();

  shouldFail = false;
  await page.getByRole('button', { name: 'Refresh status' }).click();
  await expect(page.getByText('The kitchen is preparing your order fresh.')).toBeVisible();
  await expect(page.getByText('1 \u00d7 Flat white')).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});
