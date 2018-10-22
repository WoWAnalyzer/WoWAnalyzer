import React from 'react';

import { Sharrq, Dambroda } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-09-21'),
    changes: <>Added statistics for <SpellLink id={SPELLS.WHITEOUT.id} /></>,
    contributors: [Dambroda],
    clIndex: 'FrostMage20180921.1',
  },
  {
    date: new Date('2018-09-10'),
    changes: <>Updated Checklist, Better <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> Support, Added Support for <SpellLink id={SPELLS.BONE_CHILLING_TALENT.id} /></>,
    contributors: [Sharrq],
    clIndex: 'FrostMage20180910.1',
  },
  {
    date: new Date('2018-08-28'),
    changes: <>Added support for <SpellLink id={SPELLS.WINTERS_REACH_TRAIT.id} /> and <SpellLink id={SPELLS.WHITEOUT.id} /></>,
    contributors: [Sharrq],
    clIndex: 'FrostMage20180828.1',
  },
  {
    date: new Date('2018-08-11'),
    changes: <>Updated for Level 120</>,
    contributors: [Sharrq],
    clIndex: 'FrostMage20180811.1',
  },
  {
    date: new Date('2018-06-10'),
    changes: <>Updated for 8.0 Prepatch</>,
    contributors: [Sharrq],
    clIndex: 'FrostMage20180610.1',
  },
];
