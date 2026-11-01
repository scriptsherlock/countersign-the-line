import { BUILT_FILE, expect, test } from './fixtures';
import { playShift, start } from './play';

test('the whole mission plays from the title to the case file', async ({ page }) => {
  await page.goto(BUILT_FILE);
  await start(page);
  for (let shift = 0; shift < 4; shift++) {
    await playShift(page);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Skip scene' }).click();
  }
  await playShift(page, 'Not enough evidence');
  await page.getByRole('button', { name: 'Follow the signal' }).click();
  await page.getByRole('button', { name: 'Skip scene' }).click();
  await expect(page.getByText('Keep the channel busy until further notice.')).toBeVisible();
  await page.getByRole('button', { name: 'Write the report' }).click();
  await page.getByRole('button', { name: 'There isn’t enough evidence' }).click();
  await expect(page.getByText('most honest')).toBeVisible();
  await page.getByRole('button', { name: 'File it' }).click();
  await page.getByRole('button', { name: /understands what it/ }).click();
  await expect(page.getByText('Try again')).toBeVisible();
  await page.getByRole('button', { name: /imitate/ }).click();
  await page.getByRole('button', { name: 'Close the file' }).click();
  await expect(page.getByRole('heading', { name: 'Mission 02 complete' })).toBeVisible();
  await expect(page.getByText('it used your countersign.')).toBeVisible();
});

test('the reveal never claims sample text is real, and shows a machine’s instructions', async ({ page }) => {
  await page.goto(BUILT_FILE);
  await start(page);
  await playShift(page);
  await expect(page.getByText('Human (sample)')).toBeVisible();
  await expect(page.getByText('Machine: a rules bot')).toBeVisible();
  await expect(page.locator('.persona')).toContainText('Remember nothing.');
  await expect(page.locator('.operators')).not.toContainText('Written by');
});

test('a follow-up stays locked until its first question', async ({ page }) => {
  await page.goto(BUILT_FILE);
  await start(page);
  await expect(page.getByRole('button', { name: /Ask for a number first/ })).toBeDisabled();
  await page.getByRole('button', { name: /Pick a number/ }).click();
  await expect(page.getByRole('button', { name: /What number did you pick/ })).toBeEnabled();
});

test('a verdict can’t be printed until every operator is marked', async ({ page }) => {
  await page.goto(BUILT_FILE);
  await start(page);
  await page.locator('.question').first().click();
  await page.getByRole('button', { name: 'I’ve heard enough' }).click();
  await expect(page.getByRole('button', { name: 'Print the source' })).toBeDisabled();
  await page.locator('.operator').first().getByRole('button', { name: 'Human', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Print the source' })).toBeDisabled();
});

test('Mission 01’s final code carries the rank across', async ({ page }) => {
  await page.goto(BUILT_FILE);
  await page.locator('summary').click();
  await page.getByLabel('Field code').fill('ZENITH-9X');
  await page.getByRole('button', { name: 'Open file' }).click();
  await expect(page.getByText('Your rank carries over.')).toBeVisible();
  await start(page);
  await expect(page.locator('.rank strong')).toHaveText('Investigator');
});

test('progress survives a reload', async ({ page }) => {
  await page.goto(BUILT_FILE);
  await start(page);
  await playShift(page);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Skip scene' }).click();
  await expect(page.getByText('Second shift: shift 2 of 5')).toBeVisible();
});
