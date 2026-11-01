import { expect, type Page } from '@playwright/test';

export async function start(page: Page) {
  await page.getByRole('button', { name: 'New file' }).click();
  await page.getByRole('button', { name: /Standard/ }).click();
  await page.getByRole('button', { name: 'Skip scene' }).click();
  await expect(page.getByRole('heading', { name: 'The Line', exact: true })).toBeVisible();
}

// Plays one shift: asks until the line goes quiet, marks everyone, reveals, revises and leaves.
export async function playShift(page: Page, verdict = 'Human') {
  while (await page.getByRole('heading', { name: 'Ask the line' }).count()) await page.locator('.question:not(:disabled)').first().click();
  const operators = page.locator('.operator');
  for (let i = 0; i < await operators.count(); i++) {
    const op = operators.nth(i);
    await op.getByRole('button', { name: verdict, exact: true }).click();
    if (verdict !== 'Not enough evidence') await op.getByRole('button', { name: 'Sure', exact: true }).click();
    await op.getByRole('combobox').selectOption('Just a feeling');
  }
  await page.getByRole('button', { name: 'Print the source' }).click();
  await page.getByRole('combobox', { name: 'Clue to trust less' }).selectOption('none');
  await page.getByRole('button', { name: 'Log it' }).click();
}
