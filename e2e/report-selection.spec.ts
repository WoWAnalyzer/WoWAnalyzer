import { expect, test } from './fixtures';

test('report selection', async ({ page, homePage, fightSelectionPage }) => {
  await homePage.goto();

  await homePage.fillInReportInputWithCode('D8Jpabz1kM2rNy4X');

  await fightSelectionPage.expectFightSelectionHeaderToBeVisible();
  await fightSelectionPage.expectUrlToHaveReportCode('D8Jpabz1kM2rNy4X');
  await expect(page).toHaveTitle('FIRST DAY BAYBEE LETS GET IT');
});

test('fight selection', async ({ page, fightSelectionPage, playerSelectionPage }) => {
  await fightSelectionPage.goto('D8Jpabz1kM2rNy4X');

  await page.getByRole('link', { name: 'Kill 3:36' }).click();

  await playerSelectionPage.expectPlayerSelectionHeaderToBeVisible();
  await playerSelectionPage.expectUrlToHaveReportCodeAndFight(
    'D8Jpabz1kM2rNy4X',
    '16-Heroic+Volcoross+-+Kill+(3:36)',
  );
  await expect(page).toHaveTitle('Heroic Volcoross - Kill (3:36) in FIRST DAY BAYBEE LETS GET IT');
});

test('player selection', async ({ page, playerSelectionPage, reportPage }) => {
  await playerSelectionPage.goto('D8Jpabz1kM2rNy4X', '16-Heroic+Volcoross+-+Kill+(3:36)');

  await page
    .getByRole('link', { name: 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 449' })
    .click();

  await reportPage.expectBossDifficultyAndNameHeaderToBeVisible();
  await reportPage.expectBossDifficultyAndNameHeaderToHaveText('HeroicVolcoross');
  await reportPage.expectUrlToHave(
    'D8Jpabz1kM2rNy4X',
    '16-Heroic+Volcoross+-+Kill+(3:36)',
    'Toppledh',
  );
  await expect(page).toHaveTitle(
    'Heroic Volcoross - Kill (3:36) by Toppledh in FIRST DAY BAYBEE LETS GET IT',
  );
});

test.describe('tab selection', () => {
  test.beforeEach(async ({ reportPage }) => {
    await reportPage.goto({
      reportCode: 'D8Jpabz1kM2rNy4X',
      fightCode: '16-Heroic+Volcoross+-+Kill+(3:36)',
      playerName: 'Toppledh',
    });
  });

  test('statistics', async ({ page, reportPage }) => {
    await reportPage.clickOnStatisticsTab();

    await expect(page).toHaveURL(
      '/report/D8Jpabz1kM2rNy4X/16-Heroic+Volcoross+-+Kill+(3:36)/Toppledh/standard/statistics',
    );
  });

  test('timeline', async ({ page, reportPage }) => {
    await reportPage.clickOnTimelineTab();

    await expect(page).toHaveURL(
      '/report/D8Jpabz1kM2rNy4X/16-Heroic+Volcoross+-+Kill+(3:36)/Toppledh/standard/timeline',
    );
  });

  test('cooldowns', async ({ page, reportPage }) => {
    await reportPage.clickOnCooldownsTab();

    await expect(page).toHaveURL(
      '/report/D8Jpabz1kM2rNy4X/16-Heroic+Volcoross+-+Kill+(3:36)/Toppledh/standard/cooldowns',
    );
  });

  test('character', async ({ page, reportPage }) => {
    await reportPage.clickOnCharacterTab();

    await expect(page).toHaveURL(
      '/report/D8Jpabz1kM2rNy4X/16-Heroic+Volcoross+-+Kill+(3:36)/Toppledh/standard/character',
    );
  });

  test('about', async ({ page, reportPage }) => {
    await reportPage.clickOnAboutTab('Vengeance Demon Hunter');

    await expect(page).toHaveURL(
      '/report/D8Jpabz1kM2rNy4X/16-Heroic+Volcoross+-+Kill+(3:36)/Toppledh/standard/about',
    );
  });
});

test('perform analysis', async ({ page }) => {
  await page.goto('./');

  await page.getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>').click();
  await page
    .getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>')
    .fill('https://www.warcraftlogs.com/reports/D8Jpabz1kM2rNy4X');
  await page.getByRole('heading', { name: 'Fight selection' }).waitFor();
  await page.getByRole('link', { name: 'Kill 3:36' }).click();
  await page.getByRole('heading', { name: 'Player selection' }).waitFor();
  await page
    .getByRole('link', { name: 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 449' })
    .click();
  await page.getByText('HeroicVolcoross').waitFor();

  await expect(page).toHaveURL(
    '/report/D8Jpabz1kM2rNy4X/16-Heroic+Volcoross+-+Kill+(3:36)/Toppledh/standard',
  );
});
