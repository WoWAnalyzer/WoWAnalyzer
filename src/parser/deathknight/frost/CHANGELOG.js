import React from 'react';

import { Khazak } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
    change(date(2018, 10, 22), <>Added module for <SpellLink id={SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id} /></>, [Khazak]),
    change(date(2018, 10, 11), <>Fixed bugs in <SpellLink id={SPELLS.KILLING_MACHINE.id} /> module that caused it to give weird suggestions</>, [Khazak]),
    change(date(2018, 9, 17), 'Updated the checklist to better reflect the 8.0 playstyle', [Khazak]),
    change(date(2018, 9, 7), <>Updated the <SpellLink id={SPELLS.HOWLING_BLAST.id} /> module allow for hardcasting <SpellLink id={SPELLS.HOWLING_BLAST.id} /> to apply <SpellLink id={SPELLS.FROST_FEVER.id} /></>, [Khazak]),
    change(date(2018, 8, 27), <>Added module for <SpellLink id={SPELLS.KILLING_MACHINE.id} /> efficiency and overhauled the <SpellLink id={SPELLS.RIME.id} /> efficiency module </>, [Khazak]),
    change(date(2018, 8, 27), 'Updated for 8.0 support.  Legion modules have been removed and existing modules have been tweaked to be more accurate for 8.0.', [Khazak]),
];
