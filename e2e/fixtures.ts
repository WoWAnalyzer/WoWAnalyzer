import { Page, test as base } from '@playwright/test';

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

const ignoredErrors = [
  // React warns us about certain lifecycle things which we want to disregard for e2e tests
  /^Warning: Cannot update during an existing state transition/i,
  /^Warning: Can't perform a React state update on an unmounted component/i,
  // Error output from the spellusable tracker whenever there's a cd/haste mismatch
  /^Cooldown error/i,
  /was cast while the Global Cooldown from/i,
  // Error when images fail to load (which happens a lot for characters etc.)
  /^Failed to load resource: the server responded with a status of 404/i,
  // Error when using nth-child in CSS selectors
  /The pseudo class ":nth-child" is potentially unsafe when doing server-side rendering/i,
];

function throwOnError(page: Page) {
  page.on('console', (msg) => {
    const errorText = msg.text();

    if (msg.type() === 'error') {
      if (ignoredErrors.some((ignoredError) => ignoredError.test(errorText))) {
        return;
      }

      throw new Error(errorText);
    }
  });
}

export const test = base.extend<WaFixtures>({
  fightSelectionPage: async ({ page }, use) => {
    throwOnError(page);

    await use(new FightSelectionPage(page));
  },
  homePage: async ({ page }, use) => {
    throwOnError(page);

    await use(new HomePage(page));
  },
  playerSelectionPage: async ({ page }, use) => {
    throwOnError(page);

    await use(new PlayerSelectionPage(page));
  },
  reportPage: async ({ page }, use) => {
    throwOnError(page);

    await use(new ReportPage(page));
  },
});

export { expect } from '@playwright/test';
