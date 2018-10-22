import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { tsabo, Cloake, Zerotorescue } from 'CONTRIBUTORS';

export default [
  {
    date: new Date('2018-08-02'),
    changes: 'Added natural energy regen.',
    contributors: [tsabo],
    clIndex: 'Assassination20180802.1',
  },
  {
    date: new Date('2018-07-27'),
    changes: <>Added <SpellLink id={SPELLS.ELABORATE_PLANNING_TALENT.id} /> support.</>,
    contributors: [Cloake],
    clIndex: 'Assassination20180727.1',
  },
  {
    date: new Date('2018-07-09'),
    changes: 'Added blindside support.',
    contributors: [tsabo],
    clIndex: 'Assassination20180709.1',
  },
  {
    date: new Date('2018-07-07'),
    changes: 'Update for prepatch.',
    contributors: [tsabo],
    clIndex: 'Assassination20180707.1',
  },
  {
    date: new Date('2018-06-24'),
    changes: 'Update all abilities to new BFA values.',
    contributors: [Zerotorescue],
    clIndex: 'Assassination20180624.1',
  },
];
