import path from 'path';

import integrationTest from 'parser/core/tests/integrationTest';

import CombatLogParser from '../CombatLogParser';

describe('Marksmanship Hunter integration test: Single Target', integrationTest(
  CombatLogParser,
  path.resolve(__dirname, 'marksmanship-single-target.zip'),
));

describe('Marksmanship Hunter integration test: Multi Target', integrationTest(
  CombatLogParser,
  path.resolve(__dirname, 'marksmanship-multi-target.zip'),
));
