import { Page, test as base } from '@playwright/test';

import { FightSelectionPage } from './poms/fight-selection-page';
import { HomePage } from './poms/home-page';
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
  // sentry reproducing errors
  /^An error occurred and was sent to Sentry/i,

  // we have a ton of these nesting errors across the site right now, letting e2e pass without fixing them all
  /validateDOMNesting/,
  // react-transition-group triggers this
  /^Warning: React does not recognize the `[^`]+` prop on a DOM element./i,

  // Error when images fail to load (which happens a lot for characters etc.)
  /^Failed to load resource: the server responded with a status of (404|403)/i,
  // When running on CI, we don't have access to the internet, so we can't load images
  /^Failed to load resource: net::ERR_NAME_NOT_RESOLVED/i,

  // Error from emotion.js when using nth-child|first-child in CSS selectors
  /The pseudo class "(:nth-child|:first-child)" is potentially unsafe when doing server-side rendering/i,

  // WOWAnalyzer Specific errors

  // Error output from the spellusable tracker whenever there's a cd/haste mismatch
  /^Cooldown error/i,
  /was cast while the Global Cooldown from/i,
  // Error caused by bad buff tracking
  /buff (was refreshed|stack updated) while active buff wasn't known/i,
  // Error caused by healing before knowing players
  /^Received a heal before we know the player location/i,

  // Holy Paladin specific
  /No heal found for beacon transfer/i,
];

function throwOnError(page: Page) {
  page.on('console', (msg) => {
    const errorText = msg.text();

    if (msg.type() === 'error') {
      if (ignoredErrors.some((ignoredError) => ignoredError.test(errorText))) {
        return;
      }

      throw errorText;
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
