import { test as base } from '@playwright/test';

import { HomePage } from './poms/home-page';
import { FightSelectionPage } from './poms/fight-selection-page';
import { PlayerSelectionPage } from './poms/player-selection-page';
import { ReportPage } from './poms/report-page';

type WaFixtures = {
  fightSelectionPage: FightSelectionPage;
  homePage: HomePage;
  playerSelectionPage: PlayerSelectionPage;
  reportPage: ReportPage;
};

export const test = base.extend<WaFixtures>({
  fightSelectionPage: async ({ page }, use) => {
    await use(new FightSelectionPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  playerSelectionPage: async ({ page }, use) => {
    await use(new PlayerSelectionPage(page));
  },
  reportPage: async ({ page }, use) => {
    await use(new ReportPage(page));
  },
});

export { expect } from '@playwright/test';
