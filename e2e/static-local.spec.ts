import { expect, test } from './fixtures';
import path from 'node:path';

test('imports, analyzes, reopens, and deletes a local combat log', async ({ page }) => {
  const forbiddenRequests: string[] = [];
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('/api/v2/') || url.includes('wowanalyzer.com/i/')) {
      forbiddenRequests.push(url);
    }
  });

  await page.goto('./#/local-import');
  await expect(page.getByRole('link', { name: 'Report', exact: true })).toHaveCount(0);
  await expect(
    page.getByText('Analyze a local advanced combat-log file in your browser.'),
  ).toBeVisible();
  await page.evaluate(() => {
    const values: number[] = [];
    Object.assign(window, { __localImportProgress: values });
    new MutationObserver(() => {
      const progress = document.querySelector('progress');
      if (progress?.value !== undefined) values.push(progress.value);
    }).observe(document.body, { childList: true, subtree: true, attributes: true });
  });

  await page
    .locator('input[type=file]')
    .setInputFiles(path.join(import.meta.dirname, 'fixtures/static-local-combat-log.txt'));
  await expect(page.getByRole('heading', { name: 'Fight selection' })).toBeVisible();
  const reportUrl = page.url();

  const progress = await page.evaluate(
    () => (window as Window & { __localImportProgress?: number[] }).__localImportProgress ?? [],
  );
  expect(progress.every((value, index) => index === 0 || value >= progress[index - 1])).toBe(true);

  await page.getByRole('link', { name: /Kill #1/ }).click();
  await expect(page.getByRole('heading', { name: 'Player selection' })).toBeVisible();
  await page.getByText('Åsa', { exact: true }).last().click();

  const continueAnyway = page.getByRole('link', { name: /Continue anyway/i });
  if (await continueAnyway.isVisible()) await continueAnyway.click();
  await expect(page.getByTestId('boss-difficulty-and-name')).toBeVisible();
  await page.getByRole('link', { name: 'Statistics' }).click();
  await expect(page.getByRole('heading', { name: 'Statistics' })).toBeVisible();

  await page.reload();
  await expect(page.getByTestId('boss-difficulty-and-name')).toBeVisible();

  await page.goto('./#/local-import');
  const importedReports = page.getByRole('heading', { name: 'Imported local reports' });
  await expect(importedReports).toBeVisible();
  await importedReports.locator('..').getByRole('link', { name: 'Local combat log' }).click();
  await expect(page.getByRole('heading', { name: 'Fight selection' })).toBeVisible();

  await page.goto('./#/local-import');
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('heading', { name: 'Imported local reports' })).toBeHidden();

  await page.goto(reportUrl);
  await expect(page.getByRole('heading', { name: 'Local report unavailable' })).toBeVisible();
  expect(forbiddenRequests).toEqual([]);
});
