import Expansion from 'game/Expansion';

import PATCHES from './PATCHES';

describe('PATCHES', () => {
  it('classifies reports recorded after the 12.1 content update as current', () => {
    const reportTimestamp = Date.UTC(2026, 7, 14, 12);
    const reportPatch = PATCHES.filter((patch) => patch.gameVersion === 1)
      .sort((left, right) => right.timestamp - left.timestamp)
      .find((patch) => reportTimestamp > patch.timestamp);

    expect(reportPatch).toMatchObject({
      name: '12.1.0',
      isCurrent: true,
      expansion: Expansion.Midnight,
    });
  });
});
