import snapshotTest from 'parser/core/tests/snapshotTest';
import { suppressLogging } from 'parser/core/tests/log-tools';
import CombatLogParser from '../../CombatLogParser';
import BrewCDR from './BrewCDR';

describe('BrewCDR', () => {
  suppressLogging(true, true, false);

  it('should match the cdr snapshot', 
    snapshotTest(CombatLogParser, BrewCDR, 'brm-example', (ana) => ana.cooldownReductionRatio));
});
