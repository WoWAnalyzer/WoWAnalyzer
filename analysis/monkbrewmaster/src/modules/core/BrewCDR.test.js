import snapshotTest from 'parser/core/tests/snapshotTest';
import path from 'path';

import CombatLogParser from '../../CombatLogParser';
import BrewCDR from './BrewCDR';

describe('BrewCDR', () => {
  it(
    'should match the cdr snapshot',
    snapshotTest(
      CombatLogParser,
      BrewCDR,
      path.resolve(__dirname, '../../integrationTests/example.zip'),
      (ana) => ana.cooldownReductionRatio,
    ),
  );
});
