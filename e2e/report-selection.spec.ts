import { expect, test } from './fixtures';

test('report selection', async ({ page, homePage, fightSelectionPage }) => {
  await homePage.goto();

  await homePage.fillInReportInputWithCode('QnGVYqCkHxcwzrpX');

  await fightSelectionPage.expectFightSelectionHeaderToBeVisible();
  await fightSelectionPage.expectUrlToHaveReportCode('QnGVYqCkHxcwzrpX');
  await expect(page).toHaveTitle('Vault of the Incarnates');
});

test('fight selection', async ({ page, fightSelectionPage, playerSelectionPage }) => {
  await fightSelectionPage.goto('QnGVYqCkHxcwzrpX');

  await page.getByRole('link', { name: 'Kill 3:35' }).click();

  await playerSelectionPage.expectPlayerSelectionHeaderToBeVisible();
  await playerSelectionPage.expectUrlToHaveReportCodeAndFight(
    'QnGVYqCkHxcwzrpX',
    '7-Mythic+The+Primal+Council+-+Kill+(3:35)',
  );
  await expect(page).toHaveTitle(
    'Mythic The Primal Council - Kill (3:35) in Vault of the Incarnates',
  );
});

test('player selection', async ({ page, playerSelectionPage, reportPage }) => {
  await playerSelectionPage.goto('QnGVYqCkHxcwzrpX', '7-Mythic+The+Primal+Council+-+Kill+(3:35)');

  await page
    .getByRole('link', { name: 'Sigilweaver Vengeance Demon Hunter Vengeance Demon Hunter 411' })
    .click();

  await reportPage.expectBossDifficultyAndNameHeaderToBeVisible();
  await reportPage.expectBossDifficultyAndNameHeaderToHaveText('MythicThe Primal Council');
  await reportPage.expectUrlToHave(
    'QnGVYqCkHxcwzrpX',
    '7-Mythic+The+Primal+Council+-+Kill+(3:35)',
    'Sigilweaver',
  );
  await expect(page).toHaveTitle(
    'Mythic The Primal Council - Kill (3:35) by Sigilweaver in Vault of the Incarnates',
  );
});

test.describe('tab selection', () => {
  test.beforeEach(async ({ reportPage }) => {
    await reportPage.goto({
      reportCode: 'QnGVYqCkHxcwzrpX',
      fightCode: '7-Mythic+The+Primal+Council+-+Kill+(3:35)',
      playerName: 'Sigilweaver',
    });
  });

  test('statistics', async ({ page, reportPage }) => {
    await reportPage.clickOnStatisticsTab();

    await expect(page).toHaveURL(
      '/report/QnGVYqCkHxcwzrpX/7-Mythic+The+Primal+Council+-+Kill+(3:35)/Sigilweaver/standard/statistics',
    );
  });

  test('timeline', async ({ page, reportPage }) => {
    await reportPage.clickOnTimelineTab();

    await expect(page).toHaveURL(
      '/report/QnGVYqCkHxcwzrpX/7-Mythic+The+Primal+Council+-+Kill+(3:35)/Sigilweaver/standard/timeline',
    );
  });

  test('cooldowns', async ({ page, reportPage }) => {
    await reportPage.clickOnCooldownsTab();

    await expect(page).toHaveURL(
      '/report/QnGVYqCkHxcwzrpX/7-Mythic+The+Primal+Council+-+Kill+(3:35)/Sigilweaver/standard/cooldowns',
    );
  });

  test('character', async ({ page, reportPage }) => {
    await reportPage.clickOnCharacterTab();

    await expect(page).toHaveURL(
      '/report/QnGVYqCkHxcwzrpX/7-Mythic+The+Primal+Council+-+Kill+(3:35)/Sigilweaver/standard/character',
    );
  });

  test('about', async ({ page, reportPage }) => {
    await reportPage.clickOnAboutTab('Vengeance Demon Hunter');

    await expect(page).toHaveURL(
      '/report/QnGVYqCkHxcwzrpX/7-Mythic+The+Primal+Council+-+Kill+(3:35)/Sigilweaver/standard/about',
    );
  });
});

test('perform analysis', async ({ page }) => {
  await page.goto('./');

  await page.getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>').click();
  await page
    .getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>')
    .fill('https://www.warcraftlogs.com/reports/QnGVYqCkHxcwzrpX');
  await page.getByRole('heading', { name: 'Fight selection' }).waitFor();
  await page.getByRole('link', { name: 'Kill 3:35' }).click();
  await page.getByRole('heading', { name: 'Player selection' }).waitFor();
  await page
    .getByRole('link', { name: 'Sigilweaver Vengeance Demon Hunter Vengeance Demon Hunter 411' })
    .click();
  await page.getByText('MythicThe Primal Council').waitFor();

  await expect(page).toHaveURL(
    '/report/QnGVYqCkHxcwzrpX/7-Mythic+The+Primal+Council+-+Kill+(3:35)/Sigilweaver/standard',
  );
});
