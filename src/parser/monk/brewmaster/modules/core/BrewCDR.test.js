import snapshotTest from 'parser/core/tests/snapshotTest';
import CombatLogParser from '../../CombatLogParser';
import BrewCDR from './BrewCDR';

describe('BrewCDR', () => {
  it('should match the cdr snapshot', 
    snapshotTest(CombatLogParser, BrewCDR, 'brm-example', (ana) => ana.cooldownReductionRatio));
});
