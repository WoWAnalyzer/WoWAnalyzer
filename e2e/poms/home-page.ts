import { expect, Locator, Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly reportInput: Locator;
  readonly newsTab: Locator;
  readonly newsHeading: Locator;
  readonly specsTab: Locator;
  readonly specializationsHeading: Locator;
  readonly aboutTab: Locator;
  readonly aboutHeading: Locator;
  readonly premiumTab: Locator;
  readonly premiumHeading: Locator;
  readonly helpWantedTab: Locator;
  readonly helpWantedHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.reportInput = page.getByPlaceholder('https://www.warcraftlogs.com/reports/<report code>');
    this.newsTab = page.getByRole('link', { name: 'News' });
    this.newsHeading = page.getByRole('heading', { name: 'New stuff' });
    this.specsTab = page.getByRole('link', { name: 'Specs' });
    this.specializationsHeading = page.getByRole('heading', { name: 'Specializations' });
    this.aboutTab = page.getByRole('link', { name: 'About' });
    this.aboutHeading = page.getByRole('heading', { name: 'About WoWAnalyzer' });
    this.premiumTab = page.getByRole('main').getByRole('link', { name: 'Premium' });
    this.premiumHeading = page.getByRole('heading', { name: 'WoWAnalyzer premium' });
    this.helpWantedTab = page.getByRole('link', { name: 'Help wanted' });
    this.helpWantedHeading = page.getByRole('heading', { name: 'Help wanted' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async fillInReportInputWithUrl(reportUrl: string) {
    await this.reportInput.fill(reportUrl);
  }

  async fillInReportInputWithCode(reportCode: string) {
    await this.reportInput.fill(`https://www.warcraftlogs.com/reports/${reportCode}`);
  }

  async expectNewsHeadingToBeVisible() {
    await expect(this.newsHeading).toBeVisible();
  }

  async expectSpecsHeadingToBeVisible() {
    await expect(this.specializationsHeading).toBeVisible();
  }

  async expectAboutHeadingToBeVisible() {
    await expect(this.aboutHeading).toBeVisible();
  }

  async expectPremiumHeadingToBeVisible() {
    await expect(this.premiumHeading).toBeVisible();
  }

  async expectHelpWantedHeadingToBeVisible() {
    await expect(this.helpWantedHeading).toBeVisible();
  }

  async clickNewsTab() {
    await this.newsTab.click();
    await expect(this.page).toHaveURL('/news');
    await this.expectNewsHeadingToBeVisible();
  }

  async clickSpecsTab() {
    await this.specsTab.click();
    await expect(this.page).toHaveURL('/specs');
    await this.expectSpecsHeadingToBeVisible();
  }

  async clickAboutTab() {
    await this.aboutTab.click();
    await expect(this.page).toHaveURL('/about');
    await this.expectAboutHeadingToBeVisible();
  }

  async clickPremiumTab() {
    await this.premiumTab.click();
    await expect(this.page).toHaveURL('/premium');
    await this.expectPremiumHeadingToBeVisible();
  }

  async clickHelpWantedTab() {
    await this.helpWantedTab.click();
    await expect(this.page).toHaveURL('/help-wanted');
    await this.expectHelpWantedHeadingToBeVisible();
  }
}
