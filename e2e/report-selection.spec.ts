import { expect, test } from './fixtures';

test('report selection', async ({ page, homePage, fightSelectionPage }) => {
  await homePage.goto();

  await homePage.fillInReportInputWithCode('BGtRKFdnyf8rNH9h');

  await fightSelectionPage.expectFightSelectionHeaderToBeVisible();
  await fightSelectionPage.expectUrlToHaveReportCode('BGtRKFdnyf8rNH9h');
  await expect(page).toHaveTitle('10.2.5 vdh');
});

test('fight selection', async ({ page, fightSelectionPage, playerSelectionPage }) => {
  await fightSelectionPage.goto('BGtRKFdnyf8rNH9h');

  await page.getByRole('link', { name: 'Wipe 1 0:41' }).click();

  await playerSelectionPage.expectPlayerSelectionHeaderToBeVisible();
  await playerSelectionPage.expectUrlToHaveReportCodeAndFight(
    'BGtRKFdnyf8rNH9h',
    '3-Mythic+Overgrown+Ancient+-+Wipe+1+(0:41)',
  );
  await expect(page).toHaveTitle('Mythic Overgrown Ancient - Wipe 1 (0:41) in 10.2.5 vdh');
});

test('player selection', async ({ page, playerSelectionPage, reportPage }) => {
  await playerSelectionPage.goto('BGtRKFdnyf8rNH9h', '3-Mythic+Overgrown+Ancient+-+Wipe+1+(0:41)');

  await page
    .getByRole('link', { name: 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 485' })
    .click();

  await reportPage.expectBossDifficultyAndNameHeaderToBeVisible();
  await reportPage.expectBossDifficultyAndNameHeaderToHaveText('MythicOvergrown Ancient');
  await reportPage.expectUrlToHave(
    'BGtRKFdnyf8rNH9h',
    '3-Mythic+Overgrown+Ancient+-+Wipe+1+(0:41)',
    'Toppledh',
  );
  await expect(page).toHaveTitle(
    'Mythic Overgrown Ancient - Wipe 1 (0:41) by Toppledh in 10.2.5 vdh',
  );
});

test.describe('tab selection', () => {
  test.beforeEach(async ({ reportPage }) => {
    await reportPage.goto({
      reportCode: 'BGtRKFdnyf8rNH9h',
      fightCode: '3-Mythic+Overgrown+Ancient+-+Wipe+1+(0:41)',
      playerName: 'Toppledh',
    });
  });

  test('statistics', async ({ page, reportPage }) => {
    await reportPage.clickOnStatisticsTab();

    await expect(page).toHaveURL(
      '/report/BGtRKFdnyf8rNH9h/3-Mythic+Overgrown+Ancient+-+Wipe+1+(0:41)/Toppledh/standard/statistics',
    );
  });

  test('timeline', async ({ page, reportPage }) => {
    await reportPage.clickOnTimelineTab();

    await expect(page).toHaveURL(
      '/report/BGtRKFdnyf8rNH9h/3-Mythic+Overgrown+Ancient+-+Wipe+1+(0:41)/Toppledh/standard/timeline',
    );
  });

  test('cooldowns', async ({ page, reportPage }) => {
    await reportPage.clickOnCooldownsTab();

    await expect(page).toHaveURL(
      '/report/BGtRKFdnyf8rNH9h/3-Mythic+Overgrown+Ancient+-+Wipe+1+(0:41)/Toppledh/standard/cooldowns',
    );
  });

  test('character', async ({ page, reportPage }) => {
    await reportPage.clickOnCharacterTab();

    await expect(page).toHaveURL(
      '/report/BGtRKFdnyf8rNH9h/3-Mythic+Overgrown+Ancient+-+Wipe+1+(0:41)/Toppledh/standard/character',
    );
  });

  test('about', async ({ page, reportPage }) => {
    await reportPage.clickOnAboutTab('Vengeance Demon Hunter');

    await expect(page).toHaveURL(
      '/report/BGtRKFdnyf8rNH9h/3-Mythic+Overgrown+Ancient+-+Wipe+1+(0:41)/Toppledh/standard/about',
    );
  });
});

test('perform analysis', async ({ page }) => {
  await page.goto('./');

  await page.getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>').click();
  await page
    .getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>')
    .fill('https://www.warcraftlogs.com/reports/BGtRKFdnyf8rNH9h');
  await page.getByRole('heading', { name: 'Fight selection' }).waitFor();
  await page.getByRole('link', { name: 'Wipe 1 0:41' }).click();
  await page.getByRole('heading', { name: 'Player selection' }).waitFor();
  await page
    .getByRole('link', { name: 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 485' })
    .click();
  await page.getByText('MythicOvergrown Ancient').waitFor();

  await expect(page).toHaveURL(
    '/report/BGtRKFdnyf8rNH9h/3-Mythic+Overgrown+Ancient+-+Wipe+1+(0:41)/Toppledh/standard',
  );
});
