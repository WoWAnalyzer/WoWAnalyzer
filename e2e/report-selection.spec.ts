import { expect, test } from './fixtures';

const reportCode = 'BTrFPALK3RCNXWv7';
const reportTitle = 'Liberation of Undermine';
const fightLinkName = 'Kill 8:45';
const fightUrlPart = '41-Heroic+Chrome+King+Gallywix+-+Kill+(8:45)';
const bossTitle = `Heroic Chrome King Gallywix - Kill (8:45)`;
const fightPageTitle = `${bossTitle} in ${reportTitle}`;
const playerName = 'Eisenpelz';
const playerLinkName = `${playerName} Brewmaster Monk Brewmaster Monk 647`;
const resultsPageTitle = `${bossTitle} by ${playerName} in ${reportTitle}`;
const bossDifficultyAndName = 'HeroicChrome King Gallywix';

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
  await reportPage.expectUrlToHave(reportCode, fightUrlPart, playerName);
  await expect(page).toHaveTitle(resultsPageTitle);
});

test.describe('tab selection', () => {
  test.beforeEach(async ({ reportPage }) => {
    await reportPage.goto({
      reportCode: reportCode,
      fightCode: fightUrlPart,
      playerName,
    });
  });

  test('statistics', async ({ page, reportPage }) => {
    await reportPage.clickOnStatisticsTab();

    await expect(page).toHaveURL(
      `/report/${reportCode}/${fightUrlPart}/${playerName}/standard/statistics`,
    );
  });

  test('timeline', async ({ page, reportPage }) => {
    await reportPage.clickOnTimelineTab();

    await expect(page).toHaveURL(
      `/report/${reportCode}/${fightUrlPart}/${playerName}/standard/timeline`,
    );
  });

  // currently used report fight does not have a cooldowns tab
  test.skip('cooldowns', async ({ page, reportPage }) => {
    await reportPage.clickOnCooldownsTab();

    await expect(page).toHaveURL(
      `/report/${reportCode}/${fightUrlPart}/${playerName}/standard/cooldowns`,
    );
  });

  test('character', async ({ page, reportPage }) => {
    await reportPage.clickOnCharacterTab();

    await expect(page).toHaveURL(
      `/report/${reportCode}/${fightUrlPart}/${playerName}/standard/character`,
    );
  });

  test('about', async ({ page, reportPage }) => {
    await reportPage.clickOnAboutTab();

    await expect(page).toHaveURL(
      `/report/${reportCode}/${fightUrlPart}/${playerName}/standard/about`,
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
  await expect(page).toHaveURL(`/report/${reportCode}/${fightUrlPart}/${playerName}/standard`);
});
