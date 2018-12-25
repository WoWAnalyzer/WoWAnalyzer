import integrationTest from 'parser/core/tests/integrationTest';
import CombatLogParser from './CombatLogParser';

// Used log: https://www.warcraftlogs.com/reports/qYxANX8Bd6zPF7Kc#fight=4&type=damage-done&source=30
describe('The Affliction Warlock Analyzer', integrationTest(
  CombatLogParser,
  'affliction-warlock-example',
));
