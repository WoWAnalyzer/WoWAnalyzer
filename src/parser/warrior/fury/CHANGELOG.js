import React from 'react';

import { Eylwen, Zerotorescue } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-12-15'),
  changes: <>Updated Fury for 8.1:  removal of the GCD on <SpellLink id={SPELLS.CHARGE.id} />, added <SpellLink id={SPELLS.COLD_STEEL_HOT_BLOOD_ENERGIZE.id} /> and <SpellLink id={SPELLS.UNBRIDLED_FEROCITY.id} /></>,
  contributors: [Eylwen],
  },
  {
    date: new Date('2018-07-19'),
    changes: <>Implemented the cooldown reduction of <SpellLink id={SPELLS.ANGER_MANAGEMENT_TALENT.id} /> and added a statistic to show the cooldown reduction usage.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-30'),
    changes: <>Ignored cooldown errors triggered by <SpellLink id={SPELLS.SUDDEN_DEATH_TALENT_FURY.id} />'s random cooldown resets of <SpellLink id={SPELLS.EXECUTE_FURY.id} />.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-30'),
    changes: <>Implemented handling of random <SpellLink id={SPELLS.RAGING_BLOW.id} /> resets that guesses where the cooldown reset. Because the combatlog doesn't reveal any cooldown information we have to do manual cooldown tracking. Unfortunately there's not a single event that shows random cooldown resets, so implementing effects like the random reset of <SpellLink id={SPELLS.RAGING_BLOW.id} /> is nearly impossible. To work around this, the <SpellLink id={SPELLS.RAGING_BLOW.id} /> module will <i>guess</i> where it procced; whenever <SpellLink id={SPELLS.RAGING_BLOW.id} /> is cast, it will check if it was supposed to still be on cooldown. If so, then it will mark the cooldown as ended on the last possible trigger. This should make the cooldown of this spell reasonable given you're using procs quickly.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-30'),
    changes: 'Update all abilities to new BFA values.',
    contributors: [Zerotorescue],
  },
];
