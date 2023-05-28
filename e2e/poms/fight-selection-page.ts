import { expect, Locator, Page } from '@playwright/test';

export class FightSelectionPage {
  readonly page: Page;
  readonly fightSelectionHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fightSelectionHeader = this.page.getByRole('heading', { name: 'Fight selection' });
  }

  async goto(reportCode: string) {
    await this.page.goto(`/report/${reportCode}`);
    await this.expectFightSelectionHeaderToBeVisible();
  }

  async expectFightSelectionHeaderToBeVisible() {
    await expect(this.fightSelectionHeader).toBeVisible();
  }

  async expectUrlToHaveReportCode(reportCode: string) {
    await expect(this.page).toHaveURL(`/report/${reportCode}`);
  }
}
