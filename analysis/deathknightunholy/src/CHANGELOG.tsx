// eslint-disable-next-line no-unused-vars
import React from 'react';

import { joshinator, Khazak, LeoZhekov } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS'
import { SpellLink } from 'interface';

export default [
  change(date(2020, 1, 20), <>Add cooldown reduction tracking for <SpellLink id={SPELLS.CONVOCATION_OF_THE_DEAD.id} /></>, Khazak),
  change(date(2020, 1, 17), 'Updated Unholy with new example log and flagged for 9.0.2 support', Khazak),
  change(date(2020, 1, 17), <>Add cooldown reduction tracking for <SpellLink id={SPELLS.ARMY_OF_THE_DAMNED_TALENT.id} /></>, Khazak),
  change(date(2020, 12, 29), <>Add <SpellLink id={SPELLS.EPIDEMIC.id} /> to <SpellLink id={SPELLS.SWARMING_MIST.id} /> module and clarifying note to <SpellLink id={SPELLS.SOUL_REAPER_TALENT.id} />.  Also tweaked downtime thresholds slightly to be more generous.</>, Khazak),
  change(date(2020, 12, 20), <>Added module for <SpellLink id={SPELLS.SWARMING_MIST.id} /> and added RP gained from <SpellLink id={SPELLS.SUPERSTRAIN.id} /> to statistic damage</>, joshinator),
  change(date(2020, 12, 17), <>Fix <SpellLink id={SPELLS.SOUL_REAPER_TALENT.id} /> module from showing when it shouldn't and lower suggestion threshold for <SpellLink id={SPELLS.VIRULENT_PLAGUE.id} /></>, Khazak),
  change(date(2020, 12, 12), <>Added <SpellLink id={SPELLS.SUPERSTRAIN.id} /> module</>, joshinator),
  change(date(2020, 12, 9), <>Reworked <SpellLink id={SPELLS.SOUL_REAPER_TALENT.id}/> to use ExecuteHelper to provide cast efficiency and damage statistics</>, Khazak),
  change(date(2020, 12, 7), 'Updated Abilities with covenant signature and class abilities', Khazak),
  change(date(2020, 11, 25), <>Updated cooldown tracking to support <SpellLink id={SPELLS.DEATH_COIL.id} /> Rank 2 and <SpellLink id={SPELLS.ARMY_OF_THE_DAMNED_TALENT.id} /></>, Khazak),
  change(date(2020, 10, 27), <>Created statistics for <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> and <SpellLink id={SPELLS.RUNE_OF_HYSTERIA.id} /></>, joshinator),
  change(date(2020, 10, 26), 'Updated the deprecated statisticbox modules.', LeoZhekov),
  change(date(2020, 10, 13), <>Updated  <SpellLink id={SPELLS.FESTERING_WOUND.id} /> tracking to be more accurate for <SpellLink id={SPELLS.SCOURGE_STRIKE.id}/> and <SpellLink id={SPELLS.FESTERING_STRIKE.id} /> modules</>, Khazak),
  change(date(2020, 10, 11), 'Converted modules to Typescript', Khazak),
  change(date(2020, 8, 4), 'Behind the scenes clean up to prep for better support in Shadowlands', Khazak),
];
