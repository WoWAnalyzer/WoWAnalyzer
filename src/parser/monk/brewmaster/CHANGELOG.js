import React from 'react';

import { Abelito75, emallson, Dambroda, Zeboot, LeoZhekov, Matardarix } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 12, 10), <>Added stats for <SpellLink id={SPELLS.SCALDING_BREW.id} /> and <SpellLink id={SPELLS.EVASIVE_STRIDE.id} />.</>, emallson),
  change(date(2020, 12, 15), <>Fix <SpellLink id={SPELLS.LIGHT_BREWING_TALENT.id} /> ID</>, Matardarix),
  change(date(2020, 11, 26), <>Replaced the deprecated StatisticBoxes from the modules with the new Statistic</>, LeoZhekov),
  change(date(2020, 10, 24), <>Added checklist item and timeline annotations for bad <SpellLink id={SPELLS.TIGER_PALM.id} /> casts.</>, emallson),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 17), 'Added some missing abilities and updated ability cooldowns.', Dambroda),
  change(date(2020, 10, 16), <>Removed "Inefficient <SpellLink id={SPELLS.PURIFYING_BREW.id} /> Casts" statistic.</>, emallson),
  change(date(2020, 10, 12), 'Updated checklist to reflect the Shadowlands changes.', emallson),
  change(date(2020, 10, 6), <>Added Fallen Order statistic.</>, Abelito75),
  change(date(2020, 9, 5), <>Updated Brewmaster spells for Shadowlands.</>, emallson),
];
