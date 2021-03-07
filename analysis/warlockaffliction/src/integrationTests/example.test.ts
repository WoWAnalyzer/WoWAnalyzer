import integrationTest from 'parser/core/tests/integrationTest';
import * as path from 'path';

import CombatLogParser from '../CombatLogParser';

describe(
  'Affliction Warlock integration test: example log',
  integrationTest(CombatLogParser, path.resolve(__dirname, 'example.zip')),
);
