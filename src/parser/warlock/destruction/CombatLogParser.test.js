import integrationTest from 'parser/core/tests/integrationTest';
import CombatLogParser from './CombatLogParser';

// Used log: https://www.warcraftlogs.com/reports/XANJ7wx3j6qhQ9CB#fight=3&type=damage-done&source=6
describe('The Destruction Warlock Analyzer', integrationTest(
  CombatLogParser,
  'destruction-warlock-example',
));
