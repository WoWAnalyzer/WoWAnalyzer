import path from 'path';

import integrationTest from 'parser/core/tests/integrationTest';

import CombatLogParser from '../CombatLogParser';

//Hungering: https://www.warcraftlogs.com/reports/K8xMDdN2czg3RFGH#fight=6&type=damage-done&source=23
//Huntsman: https://www.warcraftlogs.com/reports/dD7cjMbQRVzYLtWH#fight=10&type=damage-done&source=8
describe('Elemental Shaman integration test: Hungering Destroyer log',
  integrationTest(
    CombatLogParser,
    path.resolve(__dirname, 'elemental-hungering.zip')),
);

describe('Elemental Shaman integration test: Huntsman Altimor log',
  integrationTest(
    CombatLogParser,
    path.resolve(__dirname, 'elemental-huntsman.zip')),
);
