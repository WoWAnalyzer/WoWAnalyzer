import { expect, test } from './fixtures';

test('report selection', async ({ page, homePage, fightSelectionPage }) => {
  await homePage.goto();

  await homePage.fillInReportInputWithCode('zkBJfC4PVLM9ar2G');

  await fightSelectionPage.expectFightSelectionHeaderToBeVisible();
  await fightSelectionPage.expectUrlToHaveReportCode('zkBJfC4PVLM9ar2G');
  await expect(page).toHaveTitle('2023 March 27');
});

test('fight selection', async ({ page, fightSelectionPage, playerSelectionPage }) => {
  await fightSelectionPage.goto('zkBJfC4PVLM9ar2G');

  await page.getByRole('link', { name: 'Kill 12:35' }).click();

  await playerSelectionPage.expectPlayerSelectionHeaderToBeVisible();
  await playerSelectionPage.expectUrlToHaveReportCodeAndFight(
    'zkBJfC4PVLM9ar2G',
    '16-Mythic+Raszageth+the+Storm-Eater+-+Kill+(12:35)',
  );
  await expect(page).toHaveTitle(
    'Mythic Raszageth the Storm-Eater - Kill (12:35) in 2023 March 27',
  );
});

test('player selection', async ({ page, playerSelectionPage, reportPage }) => {
  await playerSelectionPage.goto(
    'zkBJfC4PVLM9ar2G',
    '16-Mythic+Raszageth+the+Storm-Eater+-+Kill+(12:35)',
  );

  await page
    .getByRole('link', { name: 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 418' })
    .click();

  await reportPage.expectBossDifficultyAndNameHeaderToBeVisible();
  await reportPage.expectBossDifficultyAndNameHeaderToHaveText('MythicRaszageth the Storm-Eater');
  await reportPage.expectUrlToHave(
    'zkBJfC4PVLM9ar2G',
    '16-Mythic+Raszageth+the+Storm-Eater+-+Kill+(12:35)',
    'Toppledh',
  );
  await expect(page).toHaveTitle(
    'Mythic Raszageth the Storm-Eater - Kill (12:35) by Toppledh in 2023 March 27',
  );
});

test.describe('tab selection', () => {
  test.beforeEach(async ({ reportPage }) => {
    await reportPage.goto({
      reportCode: 'zkBJfC4PVLM9ar2G',
      fightCode: '16-Mythic+Raszageth+the+Storm-Eater+-+Kill+(12:35)',
      playerName: 'Toppledh',
    });
  });

  test('statistics', async ({ page, reportPage }) => {
    await reportPage.clickOnStatisticsTab();

    await expect(page).toHaveURL(
      '/report/zkBJfC4PVLM9ar2G/16-Mythic+Raszageth+the+Storm-Eater+-+Kill+(12:35)/Toppledh/standard/statistics',
    );
  });

  test('timeline', async ({ page, reportPage }) => {
    await reportPage.clickOnTimelineTab();

    await expect(page).toHaveURL(
      '/report/zkBJfC4PVLM9ar2G/16-Mythic+Raszageth+the+Storm-Eater+-+Kill+(12:35)/Toppledh/standard/timeline',
    );
  });

  test('cooldowns', async ({ page, reportPage }) => {
    await reportPage.clickOnCooldownsTab();

    await expect(page).toHaveURL(
      '/report/zkBJfC4PVLM9ar2G/16-Mythic+Raszageth+the+Storm-Eater+-+Kill+(12:35)/Toppledh/standard/cooldowns',
    );
  });

  test('character', async ({ page, reportPage }) => {
    await reportPage.clickOnCharacterTab();

    await expect(page).toHaveURL(
      '/report/zkBJfC4PVLM9ar2G/16-Mythic+Raszageth+the+Storm-Eater+-+Kill+(12:35)/Toppledh/standard/character',
    );
  });

  test('about', async ({ page, reportPage }) => {
    await reportPage.clickOnAboutTab('Vengeance Demon Hunter');

    await expect(page).toHaveURL(
      '/report/zkBJfC4PVLM9ar2G/16-Mythic+Raszageth+the+Storm-Eater+-+Kill+(12:35)/Toppledh/standard/about',
    );
  });
});

test('perform analysis', async ({ page }) => {
  await page.goto('./');

  await page.getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>').click();
  await page
    .getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>')
    .fill('https://www.warcraftlogs.com/reports/zkBJfC4PVLM9ar2G');
  await page.getByRole('heading', { name: 'Fight selection' }).waitFor();
  await page.getByRole('link', { name: 'Kill 12:35' }).click();
  await page.getByRole('heading', { name: 'Player selection' }).waitFor();
  await page
    .getByRole('link', { name: 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 418' })
    .click();
  await page.getByText('MythicRaszageth the Storm-Eater').waitFor();

  await expect(page).toHaveURL(
    '/report/zkBJfC4PVLM9ar2G/16-Mythic+Raszageth+the+Storm-Eater+-+Kill+(12:35)/Toppledh/standard',
  );
});
