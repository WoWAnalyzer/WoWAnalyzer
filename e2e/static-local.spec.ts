import { expect, test } from './fixtures';
import type { Page } from '@playwright/test';
import path from 'node:path';

const TARGET_DUMMY_SIMC_PROFILE = `# SimC Addon 12.1.0-02
# WoW 12.1.0.69299, TOC 120100
deathknight="Téstknight"
level=90
race=dark_iron_dwarf
region=eu
server=argent_dawn
spec=frost
talents=CsPAkXBWxkyfx9CbGaHonEAhLNAzMMjZAz2MzMzMLzMjMjxYYmxgZmZmZmZmZAAAAAAAAAYMbDMgFwywEyYBzMmZGYAYYmBYmBD
head=,id=249970,ilevel=289
main_hand=,id=237846,ilevel=295`;

const trackForbiddenRequests = (page: Page) => {
  const forbiddenRequests: string[] = [];
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('/api/v2/') || url.includes('wowanalyzer.com/i/')) {
      forbiddenRequests.push(url);
    }
  });
  return forbiddenRequests;
};

const continueAnywayIfNeeded = async (page: Page) => {
  const continueAnyway = page.getByRole('link', { name: /Continue anyway/i });
  const results = page.getByTestId('boss-difficulty-and-name');
  await Promise.race([
    continueAnyway.waitFor({ state: 'visible' }),
    results.waitFor({ state: 'visible' }),
  ]);
  if (await continueAnyway.isVisible()) await continueAnyway.click();
};

test('automatically routes an encounter log without synthetic preparation', async ({ page }) => {
  const forbiddenRequests = trackForbiddenRequests(page);

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
  await expect(page.getByRole('form', { name: 'Prepare target-dummy import' })).toHaveCount(0);
  const reportUrl = page.url();

  const progress = await page.evaluate(
    () => (window as Window & { __localImportProgress?: number[] }).__localImportProgress ?? [],
  );
  expect(progress.every((value, index) => index === 0 || value >= progress[index - 1])).toBe(true);

  await page.getByRole('link', { name: /Kill #1/ }).click();
  await expect(page.getByRole('heading', { name: 'Player selection' })).toBeVisible();
  await page.getByText('Åsa', { exact: true }).last().click();

  await continueAnywayIfNeeded(page);
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

test('automatically routes, analyzes, reopens, and deletes a target-dummy log', async ({
  page,
}) => {
  const forbiddenRequests = trackForbiddenRequests(page);
  const sourceFixture = path.join(
    import.meta.dirname,
    '../src/local/target-dummy/test-fixtures/derived/current-retail-samples.log',
  );

  await page.goto('./#/local-import');
  await page.locator('input[type=file]').setInputFiles(sourceFixture);

  const preparation = page.getByRole('form', { name: 'Prepare target-dummy import' });
  await expect(preparation).toBeVisible();
  await expect(page.getByText('Téstknight-ExampleRealm', { exact: true }).first()).toBeVisible();
  await preparation.getByRole('radio').check();
  await preparation.getByLabel('SimulationCraft addon export').fill(TARGET_DUMMY_SIMC_PROFILE);
  await preparation.getByRole('button', { name: 'Import selected attempt' }).click();

  await continueAnywayIfNeeded(page);
  await expect(page.getByTestId('boss-difficulty-and-name')).toContainText('Training Dummy');
  await expect(page.getByText(/Target-dummy import notes/)).toBeVisible();
  const reportUrl = page.url();
  expect(reportUrl).toMatch(/#\/local\/[^/]+\/1-[^/]+\/1-[^/]+\/standard$/);

  await page.reload();
  await continueAnywayIfNeeded(page);
  await expect(page.getByTestId('boss-difficulty-and-name')).toContainText('Training Dummy');
  await expect(page.getByText(/Target-dummy import notes/)).toBeVisible();

  await page.goto('./#/local-import');
  const importedReports = page.getByRole('heading', { name: 'Imported local reports' });
  await expect(importedReports).toBeVisible();
  await importedReports.locator('..').getByRole('link', { name: 'Local combat log' }).click();
  await expect(page.getByRole('heading', { name: 'Fight selection' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Training Dummy' })).toBeVisible();
  await page.getByRole('link', { name: /Wipe #1/ }).click();
  await expect(page.getByRole('heading', { name: 'Player selection' })).toBeVisible();
  await page.getByRole('link', { name: /^Téstknight-ExampleRealm/ }).click();
  await continueAnywayIfNeeded(page);
  await expect(page.getByTestId('boss-difficulty-and-name')).toContainText('Training Dummy');

  await page.goto('./#/local-import');
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('heading', { name: 'Imported local reports' })).toBeHidden();

  await page.goto(reportUrl);
  await expect(page.getByRole('heading', { name: 'Local report unavailable' })).toBeVisible();
  expect(forbiddenRequests).toEqual([]);
});
