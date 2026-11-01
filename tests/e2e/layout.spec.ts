import { expect, test } from './fixtures';
import { start } from './play';

async function expectNoOverflow(page: import('@playwright/test').Page) {
  const size = await page.evaluate(() => { const r = document.documentElement; return { width: r.scrollWidth, height: r.scrollHeight, viewWidth: r.clientWidth, viewHeight: r.clientHeight }; });
  expect(size.width).toBeLessThanOrEqual(size.viewWidth);
  expect(size.height).toBeLessThanOrEqual(size.viewHeight);
}

test('the title and the Line room fit the screen with no overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Countersign' })).toBeVisible();
  await expectNoOverflow(page);
  await start(page);
  await expectNoOverflow(page);
});
