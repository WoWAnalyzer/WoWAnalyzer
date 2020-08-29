import path from 'path';

import integrationTest from 'parser/core/tests/integrationTest';

import CombatLogParser from '../CombatLogParser';

describe(
  'Unholy Death Knight integration test: example log',
  integrationTest(CombatLogParser, path.resolve(__dirname, 'example.zip')),
);
