import React from 'react';

import { Maldark, Aelexe, Zerotorescue } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-06-30'),
    changes: <React.Fragment>Ignored cooldown errors triggered by <SpellLink id={SPELLS.SUDDEN_DEATH_TALENT.id} />'s random cooldown resets of <SpellLink id={SPELLS.EXECUTE_FURY.id} />.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-30'),
    changes: <React.Fragment>Implemented handling of random <SpellLink id={SPELLS.RAGING_BLOW.id} /> resets that guesses where the cooldown reset. Because the combatlog doesn't reveal any cooldown information we have to do manual cooldown tracking. Unfortunately there's not a single event that shows random cooldown resets, so implementing effects like the random reset of <SpellLink id={SPELLS.RAGING_BLOW.id} /> is nearly impossible. To work around this, the <SpellLink id={SPELLS.RAGING_BLOW.id} /> module will <i>guess</i> where it procced; whenever <SpellLink id={SPELLS.RAGING_BLOW.id} /> is cast, it will check if it was supposed to still be on cooldown. If so, then it will mark the cooldown as ended on the last possible trigger. This should make the cooldown of this spell reasonable given you're using procs quickly.</React.Fragment>,
    contributors: [Zerotorescue],
  },
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
