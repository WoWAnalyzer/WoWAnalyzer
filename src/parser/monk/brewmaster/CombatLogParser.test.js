import CombatLogParser from './CombatLogParser';
import integrationTest from 'parser/core/tests/CombatLogParserIntegrationTest';

const FIGHT_ID = 12;
const PLAYER_ID = 3;

describe('The Brewmaster Analyzer', integrationTest(
  CombatLogParser,
  __dirname + '/test-fixtures/example/meta.json',
  __dirname + '/test-fixtures/example/combatant-info.json',
  __dirname + '/test-fixtures/example/events.json.gz',
  FIGHT_ID,
  PLAYER_ID
));
