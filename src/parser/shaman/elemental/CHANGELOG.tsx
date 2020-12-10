import React from 'react';

import { HawkCorrigan, Zeboot } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 11, 8), <>Adding a module Static </>, HawkCorrigan),
  change(date(2020, 11, 4), <>Fix Flame Shock</>, HawkCorrigan),
  change(date(2020, 10, 31), <>Add a suggestion for usage of Echoing Shock</>, HawkCorrigan),
  change(date(2020, 10, 25), <>Convert to Typescript</>, HawkCorrigan),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 8, 28), <>First go at removing obsolete Spells and Azerite.</>, [HawkCorrigan]),
];
