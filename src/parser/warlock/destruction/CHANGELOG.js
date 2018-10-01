import React from 'react';

import { Chizu } from 'CONTRIBUTORS';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

export default [
  {
    date: new Date('2018-10-02'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id} /> stack tracker.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-09-21'),
    changes: 'Removed all legendaries and tier set modules.',
    contributors: [Chizu],
  },
  {
    date: new Date('2018-06-25'),
    changes: 'Updated the basics of the spec for BFA. Reworked Soul Shard Fragment tracking.',
    contributors: [Chizu],
  },
];
