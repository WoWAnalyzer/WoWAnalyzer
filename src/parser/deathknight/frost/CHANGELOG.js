import React from 'react';

import { Khazak } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
    {
      date: new Date('2018-10-22'),
      changes: <>Added module for <SpellLink id={SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id} /></>,
      contributors: [Khazak],
    },
    {
      date: new Date('2018-10-11'),
      changes: <>Fixed bugs in <SpellLink id={SPELLS.KILLING_MACHINE.id} /> module that caused it to give weird suggestions</>,
      contributors: [Khazak],
    },
    {
      date: new Date('2018-09-17'),
      changes: 'Updated the checklist to better reflect the 8.0 playstyle',
      contributors: [Khazak],
    },
    {
      date: new Date('2018-09-07'),
      changes: <>Updated the <SpellLink id={SPELLS.HOWLING_BLAST.id} /> module allow for hardcasting <SpellLink id={SPELLS.HOWLING_BLAST.id} /> to apply <SpellLink id={SPELLS.FROST_FEVER.id} /></>,
      contributors: [Khazak],
    },
    {
      date: new Date('2018-08-27'),
      changes: <>Added module for <SpellLink id={SPELLS.KILLING_MACHINE.id} /> efficiency and overhauled the <SpellLink id={SPELLS.RIME.id} /> efficiency module </>,
      contributors: [Khazak],
    },
    {
      date: new Date('2018-08-27'),
      changes: 'Updated for 8.0 support.  Legion modules have been removed and existing modules have been tweaked to be more accurate for 8.0.',
      contributors: [Khazak],
    },
];
