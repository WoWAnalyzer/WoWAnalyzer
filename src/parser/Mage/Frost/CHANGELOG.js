import React from 'react';

import { Sharrq, Dambroda } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-09-21'),
    changes: <React.Fragment>Added statistics for <SpellLink id={SPELLS.WHITEOUT.id} /></React.Fragment>,
    contributors: [Dambroda],
  },
  {
    date: new Date('2018-09-10'),
    changes: <React.Fragment>Updated Checklist, Better <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> Support, Added Support for <SpellLink id={SPELLS.BONE_CHILLING_TALENT.id} /></React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-28'),
    changes: <React.Fragment>Added support for <SpellLink id={SPELLS.WINTERS_REACH_TRAIT.id} /> and <SpellLink id={SPELLS.WHITEOUT.id} /></React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-11'),
    changes: <React.Fragment>Updated for Level 120</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-06-10'),
    changes: <React.Fragment>Updated for 8.0 Prepatch</React.Fragment>,
    contributors: [Sharrq],
  },
];
