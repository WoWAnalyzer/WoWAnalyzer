import integrationTest from 'parser/core/tests/integrationTest';
import CombatLogParser from './CombatLogParser';

describe('Elemental Shaman integration test', integrationTest(
  CombatLogParser,
  'elemental-shaman',
));
