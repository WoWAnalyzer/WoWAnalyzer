import { expect, test } from './fixtures';

test('report selection', async ({ page, homePage, fightSelectionPage }) => {
  await homePage.goto();

  await homePage.fillInReportInputWithCode('RFwbnM4JcfvjNtmg');

  await fightSelectionPage.expectFightSelectionHeaderToBeVisible();
  await fightSelectionPage.expectUrlToHaveReportCode('RFwbnM4JcfvjNtmg');
  await expect(page).toHaveTitle('time 2 gayme up');
});

test('fight selection', async ({ page, fightSelectionPage, playerSelectionPage }) => {
  await fightSelectionPage.goto('RFwbnM4JcfvjNtmg');

  await page.getByRole('link', { name: 'Kill 6:25' }).click();

  await playerSelectionPage.expectPlayerSelectionHeaderToBeVisible();
  await playerSelectionPage.expectUrlToHaveReportCodeAndFight(
    'RFwbnM4JcfvjNtmg',
    '40-Mythic+Rashok,+the+Elder+-+Kill+(6:25)',
  );
  await expect(page).toHaveTitle('Mythic Rashok, the Elder - Kill (6:25) in time 2 gayme up');
});

test('player selection', async ({ page, playerSelectionPage, reportPage }) => {
  await playerSelectionPage.goto('RFwbnM4JcfvjNtmg', '40-Mythic+Rashok,+the+Elder+-+Kill+(6:25)');

  await page
    .getByRole('link', { name: 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 444' })
    .click();

  await reportPage.expectBossDifficultyAndNameHeaderToBeVisible();
  await reportPage.expectBossDifficultyAndNameHeaderToHaveText('MythicRashok, the Elder');
  await reportPage.expectUrlToHave(
    'RFwbnM4JcfvjNtmg',
    '40-Mythic+Rashok,+the+Elder+-+Kill+(6:25)',
    'Toppledh',
  );
  await expect(page).toHaveTitle(
    'Mythic Rashok, the Elder - Kill (6:25) by Toppledh in time 2 gayme up',
  );
});

test.describe('tab selection', () => {
  test.beforeEach(async ({ reportPage }) => {
    await reportPage.goto({
      reportCode: 'RFwbnM4JcfvjNtmg',
      fightCode: '40-Mythic+Rashok,+the+Elder+-+Kill+(6:25)',
      playerName: 'Toppledh',
    });
  });

  test('statistics', async ({ page, reportPage }) => {
    await reportPage.clickOnStatisticsTab();

    await expect(page).toHaveURL(
      '/report/RFwbnM4JcfvjNtmg/40-Mythic+Rashok,+the+Elder+-+Kill+(6:25)/Toppledh/standard/statistics',
    );
  });

  test('timeline', async ({ page, reportPage }) => {
    await reportPage.clickOnTimelineTab();

    await expect(page).toHaveURL(
      '/report/RFwbnM4JcfvjNtmg/40-Mythic+Rashok,+the+Elder+-+Kill+(6:25)/Toppledh/standard/timeline',
    );
  });

  test('cooldowns', async ({ page, reportPage }) => {
    await reportPage.clickOnCooldownsTab();

    await expect(page).toHaveURL(
      '/report/RFwbnM4JcfvjNtmg/40-Mythic+Rashok,+the+Elder+-+Kill+(6:25)/Toppledh/standard/cooldowns',
    );
  });

  test('character', async ({ page, reportPage }) => {
    await reportPage.clickOnCharacterTab();

    await expect(page).toHaveURL(
      '/report/RFwbnM4JcfvjNtmg/40-Mythic+Rashok,+the+Elder+-+Kill+(6:25)/Toppledh/standard/character',
    );
  });

  test('about', async ({ page, reportPage }) => {
    await reportPage.clickOnAboutTab('Vengeance Demon Hunter');

    await expect(page).toHaveURL(
      '/report/RFwbnM4JcfvjNtmg/40-Mythic+Rashok,+the+Elder+-+Kill+(6:25)/Toppledh/standard/about',
    );
  });
});

test('perform analysis', async ({ page }) => {
  await page.goto('./');

  await page.getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>').click();
  await page
    .getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>')
    .fill('https://www.warcraftlogs.com/reports/RFwbnM4JcfvjNtmg');
  await page.getByRole('heading', { name: 'Fight selection' }).waitFor();
  await page.getByRole('link', { name: 'Kill 6:25' }).click();
  await page.getByRole('heading', { name: 'Player selection' }).waitFor();
  await page
    .getByRole('link', { name: 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 444' })
    .click();
  await page.getByText('MythicRashok, the Elder').waitFor();

  await expect(page).toHaveURL(
    '/report/RFwbnM4JcfvjNtmg/40-Mythic+Rashok,+the+Elder+-+Kill+(6:25)/Toppledh/standard',
  );
});
