import { test } from './fixtures';

import { SUPPORTED_SPECS } from './generated/supportedSpecs';

test.describe('supported spec configs', () => {
  for (const SPEC of SUPPORTED_SPECS) {
    test(`${SPEC.fullName} example report loads`, async ({ page, reportPage }) => {
      await reportPage.gotoUrl({ reportUrl: SPEC.exampleReport });
      await reportPage.waitUntilLoaded();

      await reportPage.clickOnAboutTab(SPEC.name);
    });
  }
});
