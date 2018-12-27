import integrationTest from 'parser/core/tests/integrationTest';
import CombatLogParser from './CombatLogParser';

// Used log: https://www.warcraftlogs.com/reports/fFLGvgBQD7hbMAm4#fight=1&type=damage-done&source=11
describe('The Demonology Warlock Analyzer', integrationTest(
  CombatLogParser,
  'demonology-warlock-example',
));
