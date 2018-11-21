import integrationTest from 'parser/core/tests/CombatLogParserIntegrationTest';
import CombatLogParser from './CombatLogParser';

describe('The Protection Paladin Analyzer', integrationTest(
  CombatLogParser,
  'prot-pally-example'
));
