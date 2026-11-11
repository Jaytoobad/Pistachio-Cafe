import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5173';

test('homepage slideshow advances automatically and menu categories scroll without a visible scrollbar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/rest/v1/**', async (route) => {
    const isOptions = route.request().method() === 'OPTIONS';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-headers': 'apikey,authorization,content-type,x-client-info,prefer',
        'access-control-allow-methods': 'GET,POST,OPTIONS',
      },
      body: isOptions ? '' : '[]',
    });
  });

  await page.goto(BASE);
  const activeHero = page.locator('.home-hero-media img.is-active');
  await expect(activeHero).toHaveAttribute('src', '/images/hero/hero-1.jpg');
  await expect(page.getByRole('button', { name: /Pause slideshow|Play slideshow/ })).toHaveCount(0);
  await expect(activeHero).toHaveAttribute('src', '/images/hero/hero-pistachio-cup.jpg', { timeout: 8000 });

  await page.getByRole('button', { name: 'Previous image' }).click();
  await expect(activeHero).toHaveAttribute('src', '/images/hero/hero-1.jpg');

  const categoryTrack = page.locator('.home-menu-grid');
  await expect(page.locator('.home-menu-tile')).toHaveCount(4);
  await expect(categoryTrack).toHaveCSS('scrollbar-width', 'none');
  // The category track advances on its own, and resumes after a pause.
  await expect.poll(() => categoryTrack.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Next menu categories' }).click();
  await expect.poll(() => categoryTrack.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);

  const sectionTitles = page.locator('.home-section-title');
  await expect(sectionTitles.first()).toHaveCSS('text-align', 'center');
  const underlineWidth = await sectionTitles.first().evaluate((element) => (
    Number.parseFloat(window.getComputedStyle(element, '::after').width)
  ));
  expect(underlineWidth).toBeGreaterThan(0);

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});
