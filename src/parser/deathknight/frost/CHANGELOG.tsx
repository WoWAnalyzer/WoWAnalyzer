import React from 'react';

import { joshinator, Khazak, LeoZhekov } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
    change(date(2020, 12, 7), 'Updated Abilities with covenant signature and class abilities', [Khazak]),
    change(date(2020, 11, 13), <>Added analyzer for <SpellLink id={SPELLS.HYPOTHERMIC_PRESENCE_TALENT.id} /></>, [Khazak]),
    change(date(2020, 11, 5), <>Added manual RP tracking for <SpellLink id={SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id} /> and updated suggestion to target a 25+ second duration</>, [Khazak]),
    change(date(2020, 10, 27), <>Created statistics for <SpellLink id={SPELLS.RUNE_OF_THE_FALLEN_CRUSADER.id} /> and <SpellLink id={SPELLS.RUNE_OF_HYSTERIA.id} /></>, joshinator),
    change(date(2020, 10, 22), 'Replaced deprecated StatisticBoxes with Statistic', [LeoZhekov]),
    change(date(2020, 10, 22), 'Tweaked spells for prepatch, fixed bug where abilities that only wasted Runic Power and generated none were not showing up in the resource tab', [Khazak]),
    change(date(2020, 10, 16), 'Updated Abilities with pre-patch spells', [Khazak]),
    change(date(2020, 8, 11), 'Converted modules to Typescript', [Khazak]),
    change(date(2020, 5, 11), <>Fixed issue where <SpellLink id={SPELLS.ICECAP_TALENT.id} /> was not properly counting the internal cooldown</>, [Khazak]),
    change(date(2020, 4, 28), <>Added <SpellLink id={SPELLS.CHILL_STREAK_TALENT.id} /> to Abilities</>, [Khazak]),
    change(date(2020, 4, 28), 'Cleaned up old text and fixed a couple bugs', [Khazak]),
    change(date(2020, 2, 2), 'Switched modules to use new event listeners', [Khazak]),
    change(date(2020, 1, 25), 'Add integration test', [Khazak]),
    change(date(2020, 1, 18), 'Updated patch compatibility to 8.3', [Khazak]),
    change(date(2019, 11, 17), <>Fixed rune gain from <SpellLink id={SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id} /> crashing the runes tab</>, [Khazak]),
    change(date(2019, 11, 13), <>Changed statistic boxes to use new position prop</>, [Khazak]),
    change(date(2019, 11, 13), <>Updated <SpellLink id={SPELLS.ICECAP_TALENT.id} /> module with 3 second reduction</>, [Khazak]),
    change(date(2019, 11, 13), <>Updated logic in <SpellLink id={SPELLS.FROSTSCYTHE_TALENT.id} /> module to be in line with the advice given in the Wowhead guide.</>, [Khazak]),
    change(date(2018, 10, 22), <>Added module for <SpellLink id={SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id} /></>, [Khazak]),
    change(date(2018, 10, 11), <>Fixed bugs in <SpellLink id={SPELLS.KILLING_MACHINE.id} /> module that caused it to give weird suggestions</>, [Khazak]),
    change(date(2018, 9, 17), 'Updated the checklist to better reflect the 8.0 playstyle', [Khazak]),
    change(date(2018, 9, 7), <>Updated the <SpellLink id={SPELLS.HOWLING_BLAST.id} /> module allow for hardcasting <SpellLink id={SPELLS.HOWLING_BLAST.id} /> to apply <SpellLink id={SPELLS.FROST_FEVER.id} /></>, [Khazak]),
    change(date(2018, 8, 27), <>Added module for <SpellLink id={SPELLS.KILLING_MACHINE.id} /> efficiency and overhauled the <SpellLink id={SPELLS.RIME.id} /> efficiency module </>, [Khazak]),
    change(date(2018, 8, 27), 'Updated for 8.0 support.  Legion modules have been removed and existing modules have been tweaked to be more accurate for 8.0.', [Khazak]),
];
