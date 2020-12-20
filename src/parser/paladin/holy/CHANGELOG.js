import React from 'react';

import { Abelito75, Putro, Zeboot } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 12, 17), <>Updated spell cooldowns!</>, Abelito75),
  change(date(2020, 12, 15), 'Bumped level of support to 9.0.2', Putro),
  change(date(2020, 12, 12), <>Add Shock Barrier!</>, Abelito75),
  change(date(2020, 12, 10), <>Fixed a bug that made devo aura inaccurate.</>, Abelito75),
  change(date(2020, 12, 10), <>Fixed bug where Light of the Martyr's ineffiecent tooltip would crash the page.</>, Abelito75),
  change(date(2020, 12, 9), <>Re-enabled stat weights :).</>, Abelito75),
  change(date(2020, 10, 18), <>Updating wording and translation tags.</>, Abelito75),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 15), <>Removed Light Of Dawn from Crusaders Might statistic box and fixed beacon uptime for glimmer players. </>, Abelito75),
  change(date(2020, 10, 14), <>Added nice graphic for DP to show how lucky or unlucky you were. </>, Abelito75),
  change(date(2020, 10, 13), <>Updated stat weight scaling. </>, Abelito75),
  change(date(2020, 8, 27), <>Updated core Holy Paladin for prepatch. </>, Abelito75),
];
