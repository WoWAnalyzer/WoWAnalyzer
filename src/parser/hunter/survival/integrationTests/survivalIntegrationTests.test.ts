import path from 'path';

import integrationTest from 'parser/core/tests/integrationTest';

import CombatLogParser from '../CombatLogParser';

describe('Survival Hunter integration test: Single Target - Birds of Prey', integrationTest(
  CombatLogParser,
  path.resolve(__dirname, 'survival-single-target-bop.zip'),
));

describe('Survival Hunter integration test: Multi Target - Birds of Prey', integrationTest(
  CombatLogParser,
  path.resolve(__dirname, 'survival-multi-target-bop.zip'),
));

describe('Survival Hunter integration test: Multi Target - Wildfire Infusion', integrationTest(
  CombatLogParser,
  path.resolve(__dirname, 'survival-multi-target-wfi.zip'),
));
