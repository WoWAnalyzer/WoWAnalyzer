import { expect, test } from './fixtures';

const reportCode = 'MPHCJLw8zR4gZqfF';
const reportTitle = 'Mythic+ Season 4';
const fightLinkName = 'Kill 22:27';
const fightUrlPart = "20-Mythic++Algeth'ar+Academy+-+Kill+(22:27)";
const bossTitle = `Mythic+ Algeth'ar Academy - Kill (22:27)`;
const fightPageTitle = `${bossTitle} in ${reportTitle}`;
const playerName = 'Smaragda';
const playerLinkName = `${playerName} Vengeance Demon Hunter Vengeance Demon Hunter 524`;
const bossDifficultyAndName = "Mythic+Algeth'ar Academy";
const resultsPageTitle = `${bossTitle} by ${playerName} in ${reportTitle}`;

test.skip('report selection', async ({ page, homePage, fightSelectionPage }) => {
  await homePage.goto();

  await homePage.fillInReportInputWithCode(reportCode);

  await fightSelectionPage.expectFightSelectionHeaderToBeVisible();
  await fightSelectionPage.expectUrlToHaveReportCode(reportCode);
  await expect(page).toHaveTitle(reportTitle);
});

test('fight selection', async ({ page, fightSelectionPage, playerSelectionPage }) => {
  await fightSelectionPage.goto(reportCode);

  await page.getByRole('link', { name: fightLinkName }).click();

  await playerSelectionPage.expectPlayerSelectionHeaderToBeVisible();
  await playerSelectionPage.expectUrlToHaveReportCodeAndFight(reportCode, fightUrlPart);
  await expect(page).toHaveTitle(fightPageTitle);
});

test('player selection', async ({ page, playerSelectionPage, reportPage }) => {
  await playerSelectionPage.goto(reportCode, fightUrlPart);

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

  test('cooldowns', async ({ page, reportPage }) => {
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

test('perform analysis', async ({ page }) => {
  await page.goto('./');

  await page.getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>').click();
  await page
    .getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>')
    .fill(`https://www.warcraftlogs.com/reports/${reportCode}`);
  await page.getByRole('heading', { name: 'Fight selection' }).waitFor();
  await page.getByRole('link', { name: fightLinkName }).click();
  await page.getByRole('heading', { name: 'Player selection' }).waitFor();
  await page.getByRole('link', { name: playerLinkName }).click();
  await page.getByText(bossDifficultyAndName).waitFor();

  await expect(page).toHaveURL(`/report/${reportCode}/${fightUrlPart}/${playerName}/standard`);
});
