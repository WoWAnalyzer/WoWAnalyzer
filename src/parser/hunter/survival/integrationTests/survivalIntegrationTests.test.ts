import path from 'path';

import integrationTest from 'parser/core/tests/integrationTest';

import CombatLogParser from '../CombatLogParser';

describe('Survival Hunter integration test: Single Target', integrationTest(
  CombatLogParser,
  path.resolve(__dirname, 'survival-single-target.zip'),
));

describe('Survival Hunter integration test: Multi Target', integrationTest(
  CombatLogParser,
  path.resolve(__dirname, 'survival-multi-target.zip'),
));
