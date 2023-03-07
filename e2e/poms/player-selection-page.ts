import { expect, Locator, Page } from '@playwright/test';

export class PlayerSelectionPage {
  readonly page: Page;
  readonly playerSelectionHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.playerSelectionHeader = this.page.getByRole('heading', { name: 'Player selection' });
  }

  async goto(reportCode: string, fightCode: string) {
    await this.page.goto(`/report/${reportCode}/${fightCode}`);
    await this.expectPlayerSelectionHeaderToBeVisible();
  }

  async expectPlayerSelectionHeaderToBeVisible() {
    await this.playerSelectionHeader.isVisible();
  }

  async expectUrlToHaveReportCodeAndFight(reportCode: string, fightCode: string) {
    await expect(this.page).toHaveURL(`/report/${reportCode}/${fightCode}`);
  }

  async expectReportToHaveTitle(title: string) {
    await expect(this.page).toHaveTitle(title);
  }
}
