import integrationTest from 'parser/core/tests/integrationTest';
import CombatLogParser from './CombatLogParser';

describe('The Frost Mage Analyzer', integrationTest(
  CombatLogParser,
  'frost-mage-example'
));
