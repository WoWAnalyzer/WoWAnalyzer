import path from 'path';

import integrationTest from 'parser/core/tests/integrationTest';

import CombatLogParser from '../CombatLogParser';

describe('Beast Mastery Hunter integration test: Single Target', integrationTest(
  CombatLogParser,
  path.resolve(__dirname, 'beast-mastery-single-target.zip'),
));

describe('Beast Mastery Hunter integration test: Multi Target', integrationTest(
  CombatLogParser,
  path.resolve(__dirname, 'beast-mastery-multi-target.zip'),
));
