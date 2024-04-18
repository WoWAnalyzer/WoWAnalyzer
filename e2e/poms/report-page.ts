import { expect, Locator, Page } from '@playwright/test';

type GoToShared = {
  /** Should this handle the expansion check step automatically? */
  handleExpansionChecker?: boolean;

  /** Should this handle the patch check step automatically? */
  handlePatchChecker?: boolean;

  /** Should this handle the partial support check step automatically? */
  handlePartial?: boolean;

  /** Should this wait for loading to finish before returning?  */
  waitForLoadingToFinish?: boolean;
};

export class ReportPage {
  readonly page: Page;
  readonly bossDifficultyAndNameHeader: Locator;
  readonly loadingLink: Locator;
  readonly statisticsTab: Locator;
  readonly statisticsTabHeading: Locator;
  readonly timelineTab: Locator;
  readonly timeline: Locator;
  readonly cooldownsTab: Locator;
  readonly cooldownsTabHeading: Locator;
  readonly characterTab: Locator;
  readonly characterTabHeading: Locator;
  readonly aboutTab: Locator;
  readonly earlierExpansionHeading: Locator;
  readonly earlierPatchHeading: Locator;
  readonly specNotUpdatedHeading: Locator;
  readonly partialSupportHeading: Locator;
  readonly continueAnywayLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.bossDifficultyAndNameHeader = this.page.getByTestId('boss-difficulty-and-name');
    this.loadingLink = this.page.getByRole('link', { name: 'Loading...' });
    this.statisticsTab = this.page.getByRole('link', { name: 'Statistics' });
    this.statisticsTabHeading = this.page.getByRole('heading', { name: 'Statistics' });
    this.timelineTab = this.page.getByRole('link', { name: 'Timeline' });
    this.timeline = this.page.locator('.spell-timeline');
    this.cooldownsTab = this.page.getByRole('link', { name: 'Cooldowns' });
    this.cooldownsTabHeading = this.page.getByRole('heading', { name: 'Throughput cooldowns' });
    this.characterTab = this.page.getByRole('link', { name: 'Character' });
    this.characterTabHeading = this.page.getByRole('heading', { name: 'Stats on pull' });
    this.aboutTab = this.page.getByRole('link', { name: 'About', exact: true });
    this.earlierExpansionHeading = this.page.getByRole('heading', {
      name: 'This report is for a previous expansion',
    });
    this.earlierPatchHeading = this.page.getByRole('heading', {
      name: 'This report is for an earlier patch',
    });
    this.specNotUpdatedHeading = this.page.getByTestId('spec-not-updated-for-patch');
    this.partialSupportHeading = this.page.getByRole('heading', { name: 'Partial support' });
    this.continueAnywayLink = this.page.getByRole('link', { name: /Continue anyway/i });
  }

  async goto({
    reportCode,
    fightCode,
    playerName,
    build = 'standard',
    ...others
  }: GoToShared & {
    reportCode: string;
    fightCode: string;
    playerName: string;
    build?: string;
  }) {
    await this.gotoUrl({
      reportUrl: `/report/${reportCode}/${fightCode}/${playerName}/${build}`,
      ...others,
    });
  }

  async gotoUrl({
    reportUrl,
    handleExpansionChecker = true,
    handlePatchChecker = true,
    handlePartial = true,
    waitForLoadingToFinish = true,
  }: GoToShared & {
    reportUrl: string;
  }) {
    await this.page.goto(reportUrl);

    // Wait for any of the elements we know of to be visible.
    await this.earlierExpansionHeading
      .or(this.earlierPatchHeading)
      .or(this.specNotUpdatedHeading)
      .or(this.bossDifficultyAndNameHeader)
      .first()
      .waitFor();

    if ((await this.earlierExpansionHeading.isVisible()) && handleExpansionChecker) {
      await this.continueAnywayLink.click();
    }

    if ((await this.earlierPatchHeading.isVisible()) && handlePatchChecker) {
      await this.continueAnywayLink.click();
    }

    if ((await this.specNotUpdatedHeading.isVisible()) && handlePatchChecker) {
      await this.continueAnywayLink.click();
    }

    if (waitForLoadingToFinish) {
      await this.expectBossDifficultyAndNameHeaderToBeVisible();
      await this.loadingLink.waitFor({ state: 'detached' });

      if (handlePartial) {
        if (await this.partialSupportHeading.isVisible()) {
          await this.continueAnywayLink.click();
        }
      }
    }
  }

  async expectBossDifficultyAndNameHeaderToBeVisible() {
    await expect(this.bossDifficultyAndNameHeader).toBeVisible();
  }

  async expectBossDifficultyAndNameHeaderToHaveText(text: string) {
    await expect(this.bossDifficultyAndNameHeader).toHaveText(text);
  }

  async expectUrlToHave(
    reportCode: string,
    fightCode: string,
    playerName: string,
    build: string = 'standard',
  ) {
    await expect(this.page).toHaveURL(`/report/${reportCode}/${fightCode}/${playerName}/${build}`);
  }

  async waitUntilLoaded() {
    await this.loadingLink.waitFor({ state: 'detached' });
  }

  async clickOnStatisticsTab() {
    await this.statisticsTab.click();
    await expect(this.statisticsTabHeading).toBeVisible();
  }

  async clickOnTimelineTab() {
    await this.timelineTab.click();
    await this.timeline.waitFor();
    await expect(this.timeline).toBeVisible();
  }

  async clickOnCooldownsTab() {
    await this.cooldownsTab.click();
    await expect(this.cooldownsTabHeading).toBeVisible();
  }

  async clickOnCharacterTab() {
    await this.characterTab.click();
    await expect(this.characterTabHeading).toBeVisible();
  }

  async clickOnAboutTab() {
    await this.aboutTab.click();
    const aboutTabHeading = this.page.getByRole('heading', { name: /^About / });
    await expect(aboutTabHeading).toBeVisible();
  }
}
