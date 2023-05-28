import { expect, test } from './fixtures';

test('report selection', async ({ page, homePage, fightSelectionPage }) => {
  await homePage.goto();

  await homePage.fillInReportInputWithCode('cJXjr3phZ2MAkHFP');

  await fightSelectionPage.expectFightSelectionHeaderToBeVisible();
  await fightSelectionPage.expectUrlToHaveReportCode('cJXjr3phZ2MAkHFP');
  await expect(page).toHaveTitle('sniff those seeds');
});

test('fight selection', async ({ page, fightSelectionPage, playerSelectionPage }) => {
  await fightSelectionPage.goto('cJXjr3phZ2MAkHFP');

  await page.getByRole('link', { name: 'Kill 1:43' }).click();

  await playerSelectionPage.expectPlayerSelectionHeaderToBeVisible();
  await playerSelectionPage.expectUrlToHaveReportCodeAndFight(
    'cJXjr3phZ2MAkHFP',
    '1-Mythic+Eranog+-+Kill+(1:43)',
  );
  await expect(page).toHaveTitle('Mythic Eranog - Kill (1:43) in sniff those seeds');
});

test('player selection', async ({ page, playerSelectionPage, reportPage }) => {
  await playerSelectionPage.goto('cJXjr3phZ2MAkHFP', '1-Mythic+Eranog+-+Kill+(1:43)');

  await page
    .getByRole('link', { name: 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 421' })
    .click();

  await reportPage.expectBossDifficultyAndNameHeaderToBeVisible();
  await reportPage.expectBossDifficultyAndNameHeaderToHaveText('MythicEranog');
  await reportPage.expectUrlToHave('cJXjr3phZ2MAkHFP', '1-Mythic+Eranog+-+Kill+(1:43)', 'Toppledh');
  await expect(page).toHaveTitle('Mythic Eranog - Kill (1:43) by Toppledh in sniff those seeds');
});

test.describe('tab selection', () => {
  test.beforeEach(async ({ reportPage }) => {
    await reportPage.goto({
      reportCode: 'cJXjr3phZ2MAkHFP',
      fightCode: '1-Mythic+Eranog+-+Kill+(1:43)',
      playerName: 'Toppledh',
    });
  });

  test('statistics', async ({ page, reportPage }) => {
    await reportPage.clickOnStatisticsTab();

    await expect(page).toHaveURL(
      '/report/cJXjr3phZ2MAkHFP/1-Mythic+Eranog+-+Kill+(1:43)/Toppledh/standard/statistics',
    );
  });

  test('timeline', async ({ page, reportPage }) => {
    await reportPage.clickOnTimelineTab();

    await expect(page).toHaveURL(
      '/report/cJXjr3phZ2MAkHFP/1-Mythic+Eranog+-+Kill+(1:43)/Toppledh/standard/timeline',
    );
  });

  test('cooldowns', async ({ page, reportPage }) => {
    await reportPage.clickOnCooldownsTab();

    await expect(page).toHaveURL(
      '/report/cJXjr3phZ2MAkHFP/1-Mythic+Eranog+-+Kill+(1:43)/Toppledh/standard/cooldowns',
    );
  });

  test('character', async ({ page, reportPage }) => {
    await reportPage.clickOnCharacterTab();

    await expect(page).toHaveURL(
      '/report/cJXjr3phZ2MAkHFP/1-Mythic+Eranog+-+Kill+(1:43)/Toppledh/standard/character',
    );
  });

  test('about', async ({ page, reportPage }) => {
    await reportPage.clickOnAboutTab('Vengeance Demon Hunter');

    await expect(page).toHaveURL(
      '/report/cJXjr3phZ2MAkHFP/1-Mythic+Eranog+-+Kill+(1:43)/Toppledh/standard/about',
    );
  });
});

test('perform analysis', async ({ page }) => {
  await page.goto('./');

  await page.getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>').click();
  await page
    .getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>')
    .fill('https://www.warcraftlogs.com/reports/cJXjr3phZ2MAkHFP');
  await page.getByRole('heading', { name: 'Fight selection' }).waitFor();
  await page.getByRole('link', { name: 'Kill 1:43' }).click();
  await page.getByRole('heading', { name: 'Player selection' }).waitFor();
  await page
    .getByRole('link', { name: 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 421' })
    .click();
  await page.getByText('MythicEranog').waitFor();

  await expect(page).toHaveURL(
    '/report/cJXjr3phZ2MAkHFP/1-Mythic+Eranog+-+Kill+(1:43)/Toppledh/standard',
  );
});
