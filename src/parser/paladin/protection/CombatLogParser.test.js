import integrationTest from 'parser/core/tests/integrationTest';
import CombatLogParser from './CombatLogParser';

describe('The Protection Paladin Analyzer', integrationTest(
  CombatLogParser,
  'prot-pally-example'
));
