import CombatLogParser from '../../CombatLogParser';
import BrewCDR from './BrewCDR';
import snapshotTest from 'parser/core/tests/snapshotTest';

describe('BrewCDR', () => {
  snapshotTest(CombatLogParser, BrewCDR, 'brm-example');
  snapshotTest(CombatLogParser, BrewCDR, 'brm-example', function cooldownReductionRatio(ana) { return ana.cooldownReductionRatio; });
});
