import { expect, test } from './fixtures';

const reportCode = 'Mr2VApnPLycBj9hW';
const reportTitle = 'LFR princess';
const fightLinkName = 'Kill 2:30';
const fightUrlPart = '3-LFR+Council+of+Dreams+-+Kill+(2:30)';
const bossTitle = `LFR Council of Dreams - Kill (2:30)`;
const fightPageTitle = `${bossTitle} in ${reportTitle}`;
const playerLinkName = 'Toppledh Vengeance Demon Hunter Vengeance Demon Hunter 505';
const playerName = 'Toppledh';
const bossDifficultyAndName = 'LFRCouncil Of Dreams';
const resultsPageTitle = `${bossTitle} by ${playerName} in ${reportTitle}`;

test('report selection', async ({ page, homePage, fightSelectionPage }) => {
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
