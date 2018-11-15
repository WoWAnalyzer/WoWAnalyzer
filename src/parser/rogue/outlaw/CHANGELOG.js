import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { tsabo, Zerotorescue, Gebuz, Aelexe } from 'CONTRIBUTORS';

export default [
  {
    date: new Date('2018-11-15'),
    changes: <>Fixed <SpellLink id={SPELLS.ARCANE_TORRENT_ENERGY.id} /> GCD.</>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-11-13'),
    changes: <>Fixed cooldown tracking for <SpellLink id={SPELLS.MARKED_FOR_DEATH_TALENT.id} /> when targets die with the debuff.</>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-11-05'),
    changes: 'Updated resource tracking to display percent instead of per minute, and added spenders to the energy tab.',
    contributors: [Gebuz],
  },
  {
    date: new Date('2018-10-08'),
    changes: 'Reduced the recommended threshold for Arcane Torrent and added additional info to use free GCDs for it.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-08-02'),
    changes: 'Added natural energy regen.',
    contributors: [tsabo],
  },
  {
    date: new Date('2018-06-24'),
    changes: 'Update all abilities to new BFA values.',
    contributors: [Zerotorescue],
  },
];
