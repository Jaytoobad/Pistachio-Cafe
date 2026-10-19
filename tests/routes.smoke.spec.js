import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5173';

const routes = [
  '/',
  '/menu',
  '/cart',
  '/checkout',
  '/track',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/delivery',
  '/nonexistent-route-xyz',
  '/admin/login',
];

test.describe('Pistachio Café — route smoke test', () => {
  for (const route of routes) {
    test(`route ${route} renders without React errors`, async ({ page }) => {
      const errors = [];
      const warnings = [];

      page.on('console', (msg) => {
        const text = `[${msg.type()}] ${msg.text()}`;
        if (msg.type() === 'error') errors.push(text);
        else warnings.push(text);
      });
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

      const response = await page.goto(`${BASE}${route}`, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });

      await page.waitForTimeout(1500);

      const bodyText = await page.locator('body').innerText();
      expect(bodyText.trim().length).toBeGreaterThan(0);

      for (const e of errors) {
        expect(e).not.toMatch(/Minified React error/i);
      }

      if (errors.length || warnings.length) {
        console.log(`\n=== ${route} ===`);
        errors.forEach((e) => console.log('ERROR:', e));
        warnings.forEach((w) => console.log('WARN :', w));
      } else {
        console.log(`\n=== ${route} === OK (no console errors/warnings)`);
      }
    });
  }
});