// Plays key moments and saves a screenshot of each to .tmp/shots. Usage: node tests/e2e/shots.mjs [width] [height]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const width = Number(process.argv[2] ?? 1366), height = Number(process.argv[3] ?? 768);
const dir = resolve('.tmp/shots', `${width}x${height}`); mkdirSync(dir, { recursive: true });
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width, height } })).newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
const shot = async name => { await page.waitForTimeout(350); await page.screenshot({ path: resolve(dir, `${name}.png`) }); };
const click = name => page.getByRole('button', { name }).click();

async function ask() { while (await page.getByRole('heading', { name: 'Ask the line' }).count()) await page.locator('.question:not(:disabled)').first().click(); }
async function mark(first = 'Human') {
  const ops = page.locator('.operator');
  for (let i = 0; i < await ops.count(); i++) {
    await ops.nth(i).getByRole('button', { name: i ? 'Machine' : first, exact: true }).click();
    await ops.nth(i).getByRole('button', { name: i ? 'Unsure' : 'Sure', exact: true }).click();
    await ops.nth(i).getByRole('combobox').selectOption(i ? 'Too perfect' : 'Gave a lived detail');
  }
}
const finish = async () => { await click('Print the source'); await page.getByRole('combobox', { name: 'Clue to trust less' }).selectOption('none'); await click('Log it'); };

await page.goto(pathToFileURL(resolve('dist/index.html')).href);
await shot('01-title');
await click('New file'); await click(/Standard/);
await shot('02-opening');
await click('Skip scene');
await shot('03-line-empty');
await page.locator('.question').first().click(); await page.locator('.question:not(:disabled)').first().click();
await shot('04-asking');
await ask(); await shot('05-judging');
await mark(); await shot('06-marked');
await click('Print the source'); await shot('07-reveal');
await page.getByRole('combobox', { name: 'Clue to trust less' }).selectOption('none'); await click('Log it'); await shot('08-debrief');
await click('Next'); await shot('09-interlude');
for (let i = 1; i < 4; i++) { await click('Skip scene'); await ask(); await mark(); await finish(); await click('Next'); }
await click('Skip scene');
await ask(); await mark(); await shot('10-last-shift');
await finish(); await click('Follow the signal'); await click('Skip scene');
await shot('11-last-tape');
await click('Write the report'); await page.getByRole('button', { name: /isn’t enough evidence/ }).click(); await shot('12-report');
await click('File it'); await shot('13-turing');
await page.getByRole('button', { name: /imitate/ }).click(); await click('Close the file'); await shot('14-file');
await browser.close();
console.log(errors.length ? errors : 'no page errors', dir);
