import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures';
import { start } from './play';

test('axe finds no serious or critical issues on the title or the Line room', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Countersign' })).toBeVisible();
  const check = async () => { const { violations } = await new AxeBuilder({ page }).analyze(); expect(violations.filter(v => v.impact === 'serious' || v.impact === 'critical').map(v => v.id)).toEqual([]); };
  await check();
  await start(page);
  await page.locator('.question').first().click();
  await check();
});
