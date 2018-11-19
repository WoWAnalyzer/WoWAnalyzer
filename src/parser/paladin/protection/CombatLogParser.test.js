import integrationTest from 'parser/core/tests/CombatLogParserIntegrationTest';
import CombatLogParser from './CombatLogParser';

const FIGHT_ID = 1;
const PLAYER_ID = 1;

describe('The Protection Paladin Analyzer', integrationTest(
  CombatLogParser,
  'prot-pally-example',
  FIGHT_ID,
  PLAYER_ID
));
