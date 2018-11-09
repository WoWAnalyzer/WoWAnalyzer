import React from 'react';

import { Chizu } from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

export default [
  {
    date: new Date('2018-11-10'),
    changes: <>Added a Pet Timeline tab, allowing you to see your demons' lifespans and highlighting important casts, such as <SpellLink id={SPELLS.NETHER_PORTAL_TALENT.id} />, <SpellLink id={SPELLS.SUMMON_DEMONIC_TYRANT.id} /> and <SpellLink id={SPELLS.IMPLOSION_CAST.id} />.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-11-08'),
    changes: <>Reworked pet tracking system, fixed <SpellLink id={SPELLS.GRIMOIRE_FELGUARD_TALENT.id} /> talent module.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-09-21'),
    changes: 'Removed all legendaries and tier set modules.',
    contributors: [Chizu],
  },
];
