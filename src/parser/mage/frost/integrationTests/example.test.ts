import * as path from 'path';

import integrationTest from 'parser/core/tests/integrationTest';

import CombatLogParser from '../CombatLogParser';

describe('Frost Mage integration test: example log', integrationTest(
  CombatLogParser,
  path.resolve(__dirname, 'example.zip'),
  "NO_IL",
));
