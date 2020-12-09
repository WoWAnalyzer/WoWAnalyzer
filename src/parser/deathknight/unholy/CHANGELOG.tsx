// eslint-disable-next-line no-unused-vars
import React from 'react';

import { joshinator, Khazak, LeoZhekov } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS'
import SpellLink from 'common/SpellLink';

export default [
  change(date(2020, 12, 7), 'Updated Abilities with covenant signature and class abilities', [Khazak]),
  change(date(2020, 11, 25), <>Updated cooldown tracking to support <SpellLink id={SPELLS.DEATH_COIL.id} /> Rank 2 and <SpellLink id={SPELLS.ARMY_OF_THE_DAMNED_TALENT.id} /></>, [Khazak]),
  change(date(2020, 10, 27), <>Created statistics for <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> and <SpellLink id={SPELLS.RUNE_OF_HYSTERIA.id} /></>, joshinator),
  change(date(2020, 10, 26), 'Updated the deprecated statisticbox modules.', [LeoZhekov]),
  change(date(2020, 10, 13), <>Updated  <SpellLink id={SPELLS.FESTERING_WOUND.id} /> tracking to be more accurate for <SpellLink id={SPELLS.SCOURGE_STRIKE.id}/> and <SpellLink id={SPELLS.FESTERING_STRIKE.id} /> modules</>, [Khazak]),
  change(date(2020, 10, 11), 'Converted modules to Typescript', [Khazak]),
  change(date(2020, 8, 4), 'Behind the scenes clean up to prep for better support in Shadowlands', [Khazak]),
];
