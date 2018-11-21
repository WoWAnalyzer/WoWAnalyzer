import snapshotTest from 'parser/core/tests/snapshotTest';
import CombatLogParser from '../../CombatLogParser';
import BrewCDR from './BrewCDR';

describe('BrewCDR', () => {
  snapshotTest(CombatLogParser, BrewCDR, 'brm-example');
  snapshotTest(CombatLogParser, BrewCDR, 'brm-example', function cooldownReductionRatio(ana) { return ana.cooldownReductionRatio; });
});
