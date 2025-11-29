import { test } from './fixtures';

import { SUPPORTED_SPECS } from './generated/supportedSpecs';

test.describe('supported spec configs', () => {
  for (const SPEC of SUPPORTED_SPECS) {
    test(`${SPEC.fullName} example report loads`, async ({ reportPage }) => {
      // TODO: once we're through midnight updates, disable `handleExpansionChecker` again
      await reportPage.gotoUrl({ reportUrl: SPEC.exampleReport, handleExpansionChecker: true });
      await reportPage.waitUntilLoaded();

      await reportPage.clickOnAboutTab();
    });
  }
});
