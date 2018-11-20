import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { tsabo, Cloake, Zerotorescue, Gebuz, Aelexe } from 'CONTRIBUTORS';

export default [
  {
    date: new Date('2018-20-09'),
    changes: <>Added Bleed snapshot tracking and support for <SpellLink id={SPELLS.NIGHTSTALKER_TALENT.id} />, <SpellLink id={SPELLS.SUBTERFUGE_TALENT.id} /> and <SpellLink id={SPELLS.MASTER_ASSASSIN_TALENT.id} />.</>,
    contributors: [Gebuz],
  },
  {
    date: new Date('2018-11-09'),
    changes: <>Added <SpellLink id={SPELLS.MASTER_POISONER_TALENT.id} /> module and updated <SpellLink id={SPELLS.ELABORATE_PLANNING_TALENT.id} /> and <SpellLink id={SPELLS.BLINDSIDE_TALENT.id} /> modules.</>,
    contributors: [Gebuz],
  },
  {
    date: new Date('2018-11-11'),
    changes: <>Added suggestion for <SpellLink id={SPELLS.SHARPENED_BLADES.id} /> stack wastage.</>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-11-05'),
    changes: 'Updated resource tracking to display percent instead of per minute, and added spenders to the energy tab.',
    contributors: [Gebuz],
  },
  {
    date: new Date('2018-11-05'),
    changes: 'Added Checklist.',
    contributors: [Gebuz],
  },
  {
    date: new Date('2018-11-04'),
    changes: <>Added suggestions for <SpellLink id={SPELLS.GARROTE.id} /> and <SpellLink id={SPELLS.RUPTURE.id} /> uptime.</>,
    contributors: [Gebuz],
  },
  {
    date: new Date('2018-11-04'),
    changes: 'Added cooldowns tab',
    contributors: [Gebuz],
  },
  {
    date: new Date('2018-11-04'),
    changes: 'Updated timeline with buffs & debuffs and added missing GCDs',
    contributors: [Gebuz],
  },
  {
    date: new Date('2018-08-02'),
    changes: 'Added natural energy regen.',
    contributors: [tsabo],
  },
  {
    date: new Date('2018-07-27'),
    changes: <>Added <SpellLink id={SPELLS.ELABORATE_PLANNING_TALENT.id} /> support.</>,
    contributors: [Cloake],
  },
  {
    date: new Date('2018-07-09'),
    changes: 'Added blindside support.',
    contributors: [tsabo],
  },
  {
    date: new Date('2018-07-07'),
    changes: 'Update for prepatch.',
    contributors: [tsabo],
  },
  {
    date: new Date('2018-06-24'),
    changes: 'Update all abilities to new BFA values.',
    contributors: [Zerotorescue],
  },
];
