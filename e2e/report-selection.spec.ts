import { expect, test } from './fixtures';

test('report selection', async ({ page, homePage, fightSelectionPage }) => {
  await homePage.goto();

  await homePage.fillInReportInputWithCode('dFzCLcjyqMbX43KP');

  await fightSelectionPage.expectFightSelectionHeaderToBeVisible();
  await fightSelectionPage.expectUrlToHaveReportCode('dFzCLcjyqMbX43KP');
  await expect(page).toHaveTitle('raid day');
});

test('fight selection', async ({ page, fightSelectionPage, playerSelectionPage }) => {
  await fightSelectionPage.goto('dFzCLcjyqMbX43KP');

  await page.getByRole('link', { name: 'Kill 3:11' }).click();

  await playerSelectionPage.expectPlayerSelectionHeaderToBeVisible();
  await playerSelectionPage.expectUrlToHaveReportCodeAndFight(
    'dFzCLcjyqMbX43KP',
    '20-Mythic+Volcoross+-+Kill+(3:11)',
  );
  await expect(page).toHaveTitle('Mythic Volcoross - Kill (3:11) in raid day');
});

test('player selection', async ({ page, playerSelectionPage, reportPage }) => {
  await playerSelectionPage.goto('dFzCLcjyqMbX43KP', '20-Mythic+Volcoross+-+Kill+(3:11)');

  await page
    .getByRole('link', { name: 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 485' })
    .click();

  await reportPage.expectBossDifficultyAndNameHeaderToBeVisible();
  await reportPage.expectBossDifficultyAndNameHeaderToHaveText('MythicVolcoross');
  await reportPage.expectUrlToHave(
    'dFzCLcjyqMbX43KP',
    '20-Mythic+Volcoross+-+Kill+(3:11)',
    'Toppledh',
  );
  await expect(page).toHaveTitle('Mythic Volcoross - Kill (3:11) by Toppledh in raid day');
});

test.describe('tab selection', () => {
  test.beforeEach(async ({ reportPage }) => {
    await reportPage.goto({
      reportCode: 'dFzCLcjyqMbX43KP',
      fightCode: '20-Mythic+Volcoross+-+Kill+(3:11)',
      playerName: 'Toppledh',
    });
  });

  test('statistics', async ({ page, reportPage }) => {
    await reportPage.clickOnStatisticsTab();

    await expect(page).toHaveURL(
      '/report/dFzCLcjyqMbX43KP/20-Mythic+Volcoross+-+Kill+(3:11)/Toppledh/standard/statistics',
    );
  });

  test('timeline', async ({ page, reportPage }) => {
    await reportPage.clickOnTimelineTab();

    await expect(page).toHaveURL(
      '/report/dFzCLcjyqMbX43KP/20-Mythic+Volcoross+-+Kill+(3:11)/Toppledh/standard/timeline',
    );
  });

  test('cooldowns', async ({ page, reportPage }) => {
    await reportPage.clickOnCooldownsTab();

    await expect(page).toHaveURL(
      '/report/dFzCLcjyqMbX43KP/20-Mythic+Volcoross+-+Kill+(3:11)/Toppledh/standard/cooldowns',
    );
  });

  test('character', async ({ page, reportPage }) => {
    await reportPage.clickOnCharacterTab();

    await expect(page).toHaveURL(
      '/report/dFzCLcjyqMbX43KP/20-Mythic+Volcoross+-+Kill+(3:11)/Toppledh/standard/character',
    );
  });

  test('about', async ({ page, reportPage }) => {
    await reportPage.clickOnAboutTab('Vengeance Demon Hunter');

    await expect(page).toHaveURL(
      '/report/dFzCLcjyqMbX43KP/20-Mythic+Volcoross+-+Kill+(3:11)/Toppledh/standard/about',
    );
  });
});

test('perform analysis', async ({ page }) => {
  await page.goto('./');

  await page.getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>').click();
  await page
    .getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>')
    .fill('https://www.warcraftlogs.com/reports/dFzCLcjyqMbX43KP');
  await page.getByRole('heading', { name: 'Fight selection' }).waitFor();
  await page.getByRole('link', { name: 'Kill 3:11' }).click();
  await page.getByRole('heading', { name: 'Player selection' }).waitFor();
  await page
    .getByRole('link', { name: 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 485' })
    .click();
  await page.getByText('MythicVolcoross').waitFor();

  await expect(page).toHaveURL(
    '/report/dFzCLcjyqMbX43KP/20-Mythic+Volcoross+-+Kill+(3:11)/Toppledh/standard',
  );
});
