import integrationTest from 'parser/core/tests/integrationTest';
import path from 'path';

import CombatLogParser from '../CombatLogParser';

describe(
  'Mistweaver Monk integration test: example log',
  integrationTest(CombatLogParser, path.resolve(__dirname, 'example.zip')),
);
