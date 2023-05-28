import { test } from './fixtures';

test('news visible by default', async ({ homePage }) => {
  await homePage.goto();
  await homePage.expectNewsHeadingToBeVisible();
});

test.describe('tabs', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('news', async ({ homePage }) => {
    await homePage.clickNewsTab();
  });

  test('specs', async ({ homePage }) => {
    await homePage.clickSpecsTab();
  });

  test('about', async ({ homePage }) => {
    await homePage.clickAboutTab();
  });

  test('premium', async ({ homePage }) => {
    await homePage.clickPremiumTab();
  });

  test('help wanted', async ({ homePage }) => {
    await homePage.clickHelpWantedTab();
  });
});
