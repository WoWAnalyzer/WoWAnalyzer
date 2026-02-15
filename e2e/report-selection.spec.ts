import { expect, test } from './fixtures';

const reportCode = 'VqRJyj1fx3DCwHnb';
const reportTitle = 'HoF / ToES';
const fightLinkName = 'Kill 3:31';
const fightUrlPart = '5-Heroic+Lei+Shi+-+Kill+(3:31)';
const bossTitle = `Heroic Lei Shi - Kill (3:31)`;
const fightPageTitle = `${bossTitle} in ${reportTitle}`;
const playerId = 22;
const playerName = 'Auruch';
const playerLinkName = `Auruch Destruction Warlock Destruction Warlock 514`;
const resultsPageTitle = `Heroic Lei Shi - Kill (3:31) by Auruch in HoF / ToES`;
const bossDifficultyAndName = 'Lei ShiHeroic Kill - 3:31';

test.skip('report selection', async ({ page, homePage, fightSelectionPage }) => {
  await homePage.goto();

  await homePage.fillInReportInputWithCode(reportCode);

  await fightSelectionPage.expectFightSelectionHeaderToBeVisible();
  await fightSelectionPage.expectUrlToHaveReportCode(reportCode);
  await expect(page).toHaveTitle(reportTitle);
});

test('fight selection', async ({ page, fightSelectionPage, playerSelectionPage, reportPage }) => {
  await fightSelectionPage.goto(reportCode);

  await reportPage.handleReportChecker();
  await fightSelectionPage.expectFightSelectionHeaderToBeVisible();

  await page.getByRole('link', { name: fightLinkName }).click();

  await playerSelectionPage.expectPlayerSelectionHeaderToBeVisible();
  await playerSelectionPage.expectUrlToHaveReportCodeAndFight(reportCode, fightUrlPart);
  await expect(page).toHaveTitle(fightPageTitle);
});

test('player selection', async ({ page, playerSelectionPage, reportPage }) => {
  await playerSelectionPage.goto(reportCode, fightUrlPart);

  await reportPage.handleReportChecker();
  await playerSelectionPage.expectPlayerSelectionHeaderToBeVisible();

  await page.getByRole('link', { name: playerLinkName }).click();

  await reportPage.expectBossDifficultyAndNameHeaderToBeVisible();
  await reportPage.expectBossDifficultyAndNameHeaderToHaveText(bossDifficultyAndName);
  await reportPage.expectUrlToHave(reportCode, fightUrlPart, playerName, playerId);
  await expect(page).toHaveTitle(resultsPageTitle);
});

test.describe('tab selection', () => {
  test.beforeEach(async ({ reportPage }) => {
    await reportPage.goto({
      reportCode: reportCode,
      fightCode: fightUrlPart,
      playerName,
      playerId,
    });
  });

  test('statistics', async ({ page, reportPage }) => {
    await reportPage.clickOnStatisticsTab();

    await expect(page).toHaveURL(
      `/report/${reportCode}/${fightUrlPart}/${playerId}-${playerName}/standard/statistics`,
    );
  });

  test('timeline', async ({ page, reportPage }) => {
    await reportPage.clickOnTimelineTab();

    await expect(page).toHaveURL(
      `/report/${reportCode}/${fightUrlPart}/${playerId}-${playerName}/standard/timeline`,
    );
  });

  // currently used report fight does not have a cooldowns tab
  test.skip('cooldowns', async ({ page, reportPage }) => {
    await reportPage.clickOnCooldownsTab();

    await expect(page).toHaveURL(
      `/report/${reportCode}/${fightUrlPart}/${playerId}-${playerName}/standard/cooldowns`,
    );
  });

  test('character', async ({ page, reportPage }) => {
    await reportPage.clickOnCharacterTab();

    await expect(page).toHaveURL(
      `/report/${reportCode}/${fightUrlPart}/${playerId}-${playerName}/standard/character`,
    );
  });

  test('about', async ({ page, reportPage }) => {
    await reportPage.clickOnAboutTab();

    await expect(page).toHaveURL(
      `/report/${reportCode}/${fightUrlPart}/${playerId}-${playerName}/standard/about`,
    );
  });
});

test('perform analysis', async ({
  page,
  homePage,
  playerSelectionPage,
  fightSelectionPage,
  reportPage,
}) => {
  await page.goto('./');

  await homePage.fillInReportInputWithCode(reportCode);

  await reportPage.handleReportChecker();
  await fightSelectionPage.expectFightSelectionHeaderToBeVisible();
  await page.getByRole('link', { name: fightLinkName }).click();

  await playerSelectionPage.expectPlayerSelectionHeaderToBeVisible();
  await page.getByRole('link', { name: playerLinkName }).click();

  await page.getByText(bossDifficultyAndName).waitFor();
  await expect(page).toHaveURL(
    `/report/${reportCode}/${fightUrlPart}/${playerId}-${playerName}/standard`,
  );
});
