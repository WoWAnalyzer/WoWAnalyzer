import integrationTest from 'parser/core/tests/integrationTest';
import CombatLogParser from './CombatLogParser';

describe('The Blood Deathknight Analyzer', integrationTest(
  CombatLogParser,
  'blood-deathknight-example'
));
