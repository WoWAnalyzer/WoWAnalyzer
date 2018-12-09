import integrationTest from 'parser/core/tests/integrationTest';
import CombatLogParser from './CombatLogParser';

describe('The Brewmaster Analyzer', integrationTest(
  CombatLogParser,
  'brm-example'
));
