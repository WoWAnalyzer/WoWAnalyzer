import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { tsabo, Cloake, Zerotorescue } from 'CONTRIBUTORS';

export default [
  {
    date: new Date('2018-08-02'),
    changes: 'Added natural energy regen.',
    contributors: [tsabo],
  },
  {
    date: new Date('2018-07-27'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.ELABORATE_PLANNING_TALENT.id} /> support.</React.Fragment>,
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
