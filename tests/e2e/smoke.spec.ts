import { BUILT_FILE, expect, test } from './fixtures';
import { start } from './play';

test('the built file opens from disk with the network off, and a question gets answers', async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto(BUILT_FILE);
  await expect(page.getByRole('heading', { name: 'Countersign' })).toBeVisible();
  await start(page);
  await page.locator('.question').first().click();
  await expect(page.locator('.reply-a')).toHaveCount(2);
});
