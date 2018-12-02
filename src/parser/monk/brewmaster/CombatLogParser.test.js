import integrationTest from 'parser/core/tests/CombatLogParserIntegrationTest';
import CombatLogParser from './CombatLogParser';

describe('The Brewmaster Analyzer', integrationTest(
  CombatLogParser,
  'brm-example'
));
