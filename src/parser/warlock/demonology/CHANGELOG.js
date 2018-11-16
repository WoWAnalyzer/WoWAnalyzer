import React from 'react';

import { Chizu } from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

export default [
  {
    date: new Date('2018-11-16'),
    changes: <>Added talent modules for <SpellLink id={SPELLS.FROM_THE_SHADOWS_TALENT.id} />, <SpellLink id={SPELLS.SOUL_STRIKE_TALENT.id} /> and <SpellLink id={SPELLS.SUMMON_VILEFIEND_TALENT.id} />.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-11-12'),
    changes: 'Certain buffs or debuffs now show in timeline.',
    contributors: [Chizu],
  },
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
