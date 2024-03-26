import { expect, test } from './fixtures';

test('report selection', async ({ page, homePage, fightSelectionPage }) => {
  await homePage.goto();

  await homePage.fillInReportInputWithCode('bjqrZRnNdvKPXt13');

  await fightSelectionPage.expectFightSelectionHeaderToBeVisible();
  await fightSelectionPage.expectUrlToHaveReportCode('bjqrZRnNdvKPXt13');
  await expect(page).toHaveTitle('owl time');
});

test('fight selection', async ({ page, fightSelectionPage, playerSelectionPage }) => {
  await fightSelectionPage.goto('bjqrZRnNdvKPXt13');

  await page.getByRole('link', { name: 'Kill 8:47' }).click();

  await playerSelectionPage.expectPlayerSelectionHeaderToBeVisible();
  await playerSelectionPage.expectUrlToHaveReportCodeAndFight(
    'bjqrZRnNdvKPXt13',
    '34-Mythic+Fyrakk+the+Blazing+-+Kill+(8:47)',
  );
  await expect(page).toHaveTitle('Mythic Fyrakk the Blazing - Kill (8:47) in owl time');
});

test('player selection', async ({ page, playerSelectionPage, reportPage }) => {
  await playerSelectionPage.goto('bjqrZRnNdvKPXt13', '34-Mythic+Fyrakk+the+Blazing+-+Kill+(8:47)');

  await page
    .getByRole('link', { name: 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 488' })
    .click();

  await reportPage.expectBossDifficultyAndNameHeaderToBeVisible();
  await reportPage.expectBossDifficultyAndNameHeaderToHaveText('MythicFyrakk, the Blazing');
  await reportPage.expectUrlToHave(
    'bjqrZRnNdvKPXt13',
    '34-Mythic+Fyrakk+the+Blazing+-+Kill+(8:47)',
    'Toppledh',
  );
  await expect(page).toHaveTitle('Mythic Fyrakk the Blazing - Kill (8:47) by Toppledh in owl time');
});

test.describe('tab selection', () => {
  test.beforeEach(async ({ reportPage }) => {
    await reportPage.goto({
      reportCode: 'bjqrZRnNdvKPXt13',
      fightCode: '34-Mythic+Fyrakk+the+Blazing+-+Kill+(8:47)',
      playerName: 'Toppledh',
    });
  });

  test('statistics', async ({ page, reportPage }) => {
    await reportPage.clickOnStatisticsTab();

    await expect(page).toHaveURL(
      '/report/bjqrZRnNdvKPXt13/34-Mythic+Fyrakk+the+Blazing+-+Kill+(8:47)/Toppledh/standard/statistics',
    );
  });

  test('timeline', async ({ page, reportPage }) => {
    await reportPage.clickOnTimelineTab();

    await expect(page).toHaveURL(
      '/report/bjqrZRnNdvKPXt13/34-Mythic+Fyrakk+the+Blazing+-+Kill+(8:47)/Toppledh/standard/timeline',
    );
  });

  test('cooldowns', async ({ page, reportPage }) => {
    await reportPage.clickOnCooldownsTab();

    await expect(page).toHaveURL(
      '/report/bjqrZRnNdvKPXt13/34-Mythic+Fyrakk+the+Blazing+-+Kill+(8:47)/Toppledh/standard/cooldowns',
    );
  });

  test('character', async ({ page, reportPage }) => {
    await reportPage.clickOnCharacterTab();

    await expect(page).toHaveURL(
      '/report/bjqrZRnNdvKPXt13/34-Mythic+Fyrakk+the+Blazing+-+Kill+(8:47)/Toppledh/standard/character',
    );
  });

  test('about', async ({ page, reportPage }) => {
    await reportPage.clickOnAboutTab('Vengeance Demon Hunter');

    await expect(page).toHaveURL(
      '/report/bjqrZRnNdvKPXt13/34-Mythic+Fyrakk+the+Blazing+-+Kill+(8:47)/Toppledh/standard/about',
    );
  });
});

test('perform analysis', async ({ page }) => {
  await page.goto('./');

  await page.getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>').click();
  await page
    .getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>')
    .fill('https://www.warcraftlogs.com/reports/bjqrZRnNdvKPXt13');
  await page.getByRole('heading', { name: 'Fight selection' }).waitFor();
  await page.getByRole('link', { name: 'Kill 8:47' }).click();
  await page.getByRole('heading', { name: 'Player selection' }).waitFor();
  await page
    .getByRole('link', { name: 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 488' })
    .click();
  await page.getByText('MythicFyrakk, the Blazing').waitFor();

  await expect(page).toHaveURL(
    '/report/bjqrZRnNdvKPXt13/34-Mythic+Fyrakk+the+Blazing+-+Kill+(8:47)/Toppledh/standard',
  );
});
