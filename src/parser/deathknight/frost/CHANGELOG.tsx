import React from 'react';

import { joshinator, Khazak, LeoZhekov } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
    change(date(2020, 12, 20), <>Added module for <SpellLink id={SPELLS.SWARMING_MIST.id} /> and added RP gained from <SpellLink id={SPELLS.SUPERSTRAIN.id} /> to statistic damage</>, joshinator),
    change(date(2020, 12, 12), <>Added <SpellLink id={SPELLS.SUPERSTRAIN.id} /> module</>, joshinator),
    change(date(2020, 12, 7), 'Updated Abilities with covenant signature and class abilities', [Khazak]),
    change(date(2020, 11, 13), <>Added analyzer for <SpellLink id={SPELLS.HYPOTHERMIC_PRESENCE_TALENT.id} /></>, [Khazak]),
    change(date(2020, 11, 5), <>Added manual RP tracking for <SpellLink id={SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id} /> and updated suggestion to target a 25+ second duration</>, [Khazak]),
    change(date(2020, 10, 27), <>Created statistics for <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> and <SpellLink id={SPELLS.RUNE_OF_HYSTERIA.id} /></>, joshinator),
    change(date(2020, 10, 22), 'Replaced deprecated StatisticBoxes with Statistic', [LeoZhekov]),
    change(date(2020, 10, 22), 'Tweaked spells for prepatch, fixed bug where abilities that only wasted Runic Power and generated none were not showing up in the resource tab', [Khazak]),
    change(date(2020, 10, 16), 'Updated Abilities with pre-patch spells', [Khazak]),
];
