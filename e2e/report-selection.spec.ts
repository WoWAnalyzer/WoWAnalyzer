import { expect, test } from './fixtures';

test('report selection', async ({ page, homePage, fightSelectionPage }) => {
  await homePage.goto();

  await homePage.fillInReportInputWithCode('akZLCTYbN2XpQFmg');

  await fightSelectionPage.expectFightSelectionHeaderToBeVisible();
  await fightSelectionPage.expectUrlToHaveReportCode('akZLCTYbN2XpQFmg');
  await expect(page).toHaveTitle('SHATED');
});

test('fight selection', async ({ page, fightSelectionPage, playerSelectionPage }) => {
  await fightSelectionPage.goto('akZLCTYbN2XpQFmg');

  await page.getByRole('link', { name: 'Kill 5:44' }).click();

  await playerSelectionPage.expectPlayerSelectionHeaderToBeVisible();
  await playerSelectionPage.expectUrlToHaveReportCodeAndFight(
    'akZLCTYbN2XpQFmg',
    '63-Mythic+Smolderon+-+Kill+(5:44)',
  );
  await expect(page).toHaveTitle('Mythic Fyrakk the Blazing - Kill (8:47) in SHATED');
});

test('player selection', async ({ page, playerSelectionPage, reportPage }) => {
  await playerSelectionPage.goto('akZLCTYbN2XpQFmg', '63-Mythic+Smolderon+-+Kill+(5:44)');

  await page
    .getByRole('link', { name: 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 490' })
    .click();

  await reportPage.expectBossDifficultyAndNameHeaderToBeVisible();
  await reportPage.expectBossDifficultyAndNameHeaderToHaveText('MythicFyrakk, the Blazing');
  await reportPage.expectUrlToHave(
    'akZLCTYbN2XpQFmg',
    '63-Mythic+Smolderon+-+Kill+(5:44)',
    'Toppledh',
  );
  await expect(page).toHaveTitle('Mythic Fyrakk the Blazing - Kill (8:47) by Toppledh in SHATED');
});

test.describe('tab selection', () => {
  test.beforeEach(async ({ reportPage }) => {
    await reportPage.goto({
      reportCode: 'akZLCTYbN2XpQFmg',
      fightCode: '63-Mythic+Smolderon+-+Kill+(5:44)',
      playerName: 'Toppledh',
    });
  });

  test('statistics', async ({ page, reportPage }) => {
    await reportPage.clickOnStatisticsTab();

    await expect(page).toHaveURL(
      '/report/akZLCTYbN2XpQFmg/63-Mythic+Smolderon+-+Kill+(5:44)/Toppledh/standard/statistics',
    );
  });

  test('timeline', async ({ page, reportPage }) => {
    await reportPage.clickOnTimelineTab();

    await expect(page).toHaveURL(
      '/report/akZLCTYbN2XpQFmg/63-Mythic+Smolderon+-+Kill+(5:44)/Toppledh/standard/timeline',
    );
  });

  test('cooldowns', async ({ page, reportPage }) => {
    await reportPage.clickOnCooldownsTab();

    await expect(page).toHaveURL(
      '/report/akZLCTYbN2XpQFmg/63-Mythic+Smolderon+-+Kill+(5:44)/Toppledh/standard/cooldowns',
    );
  });

  test('character', async ({ page, reportPage }) => {
    await reportPage.clickOnCharacterTab();

    await expect(page).toHaveURL(
      '/report/akZLCTYbN2XpQFmg/63-Mythic+Smolderon+-+Kill+(5:44)/Toppledh/standard/character',
    );
  });

  test('about', async ({ page, reportPage }) => {
    await reportPage.clickOnAboutTab();

    await expect(page).toHaveURL(
      '/report/akZLCTYbN2XpQFmg/63-Mythic+Smolderon+-+Kill+(5:44)/Toppledh/standard/about',
    );
  });
});

test('perform analysis', async ({ page }) => {
  await page.goto('./');

  await page.getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>').click();
  await page
    .getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>')
    .fill('https://www.warcraftlogs.com/reports/akZLCTYbN2XpQFmg');
  await page.getByRole('heading', { name: 'Fight selection' }).waitFor();
  await page.getByRole('link', { name: 'Kill 5:44' }).click();
  await page.getByRole('heading', { name: 'Player selection' }).waitFor();
  await page
    .getByRole('link', { name: 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 490' })
    .click();
  await page.getByText('MythicSmolderon').waitFor();

  await expect(page).toHaveURL(
    '/report/akZLCTYbN2XpQFmg/63-Mythic+Smolderon+-+Kill+(5:44)/Toppledh/standard',
  );
});
