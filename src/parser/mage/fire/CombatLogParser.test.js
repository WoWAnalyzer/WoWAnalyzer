import integrationTest from 'parser/core/tests/integrationTest';
import CombatLogParser from './CombatLogParser';

describe('The Fire Mage Analyzer', integrationTest(
  CombatLogParser,
  'fire-mage-example'
));
