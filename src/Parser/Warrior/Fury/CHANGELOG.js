import React from 'react';

import { Maldark, Aelexe, Zerotorescue } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-06-30'),
    changes: 'Update all abilities to new BFA values.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-04-09'),
    changes: <React.Fragment>Add <SpellLink id={SPELLS.CHARGE.id} icon /> cooldown and charge modifications for <SpellLink id={SPELLS.DOUBLE_TIME_TALENT.id} icon />.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2017-12-25'),
    changes: 'Added T21 analysis as well as Rampage cancellation analysis and Mastery support.',
    contributors: [Maldark],
  },
  {
    date: new Date('2017-12-24'),
    changes: 'Added Rampage analysis for Frothing Berserker talent.',
    contributors: [Maldark],
  },
  {
    date: new Date('2017-12-14'),
    changes: 'Added initial support.',
    contributors: [Maldark],
  },
];
