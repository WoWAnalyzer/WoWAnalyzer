import integrationTest from 'parser/core/tests/integrationTest';
import CombatLogParser from './CombatLogParser';

describe('The Arcane Mage Analyzer', integrationTest(
  CombatLogParser,
  'arcane-mage-example'
));
