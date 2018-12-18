import integrationTest from 'parser/core/tests/integrationTest';
import CombatLogParser from './CombatLogParser';

describe('Holy Paladin integration test', integrationTest(
  CombatLogParser,
  'holy-paladin-example'
));
