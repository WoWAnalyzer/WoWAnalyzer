import React from 'react';

import { Khazak } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
    {
      date: new Date('2018-09-07'),
      changes: <React.Fragment>Updated the <SpellLink id={SPELLS.HOWLING_BLAST.id} /> module allow for hardcasting <SpellLink id={SPELLS.HOWLING_BLAST.id} /> to apply <SpellLink id={SPELLS.FROST_FEVER.id} /></React.Fragment>,
      contributors: [Khazak],
    },
    {
      date: new Date('2018-08-27'),
      changes: <React.Fragment>Added module for <SpellLink id={SPELLS.KILLING_MACHINE.id} /> efficiency and overhauled the <SpellLink id={SPELLS.RIME.id} /> efficiency module </React.Fragment>,
      contributors: [Khazak],
    },
    {
      date: new Date('2018-08-27'),
      changes: 'Updated for 8.0 support.  Legion modules have been removed and existing modules have been tweaked to be more accurate for 8.0.',
      contributors: [Khazak],
    },
];
