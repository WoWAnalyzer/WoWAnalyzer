import React from 'react';

import { joshinator, Yajinni, Zeboot, LeoZhekov } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 11, 6), 'Runeforge-suggestions', joshinator),
  change(date(2020, 10, 27), <>Created statistics for <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> and <SpellLink id={SPELLS.RUNE_OF_HYSTERIA.id} /></>, joshinator),
  change(date(2020, 10, 26), <>Replaced deprecated StatisticBox modules for talents, disable Ossuary until SL and new <SpellLink id={SPELLS.RELISH_IN_BLOOD_TALENT.id} /> module</>, joshinator),
  change(date(2020, 10, 20), 'Replaced the deprecated StatisticBox modules', LeoZhekov),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 9, 10), <>Changed <SpellLink id={SPELLS.OSSUARY.id} /> from a talent to baseline. Changed <SpellLink id={SPELLS.BLOOD_TAP_TALENT.id} /> to talent.</>, [Yajinni]),
  change(date(2020, 9, 9), <>Initial clean up and adding of spells for prepatch.</>, [Yajinni]),
];
