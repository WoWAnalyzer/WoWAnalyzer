import integrationTest from 'parser/core/tests/CombatLogParserIntegrationTest';
import CombatLogParser from './CombatLogParser';

const FIGHT_ID = 12;
const PLAYER_ID = 3;

describe('The Brewmaster Analyzer', integrationTest(
  CombatLogParser,
  'brm-example'
));
