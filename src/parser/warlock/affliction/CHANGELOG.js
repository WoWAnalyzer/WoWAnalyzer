import React from 'react';

import { Chizu } from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

export default [
  {
    date: new Date('2018-12-21'),
    changes: <>Added <SpellLink id={SPELLS.PANDEMIC_INVOCATION.id} /> trait and updated <SpellLink id={SPELLS.INEVITABLE_DEMISE.id} /> icon.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-12-23'),
    changes: 'Changed display of damage in various places. Now shows % of total damage done and DPS with raw values in tooltip.',
    contributors: [Chizu],
  },
  {
    date: new Date('2018-12-10'),
    changes: <>Updated for patch 8.1 - <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} /> nerf.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-11-15'),
    changes: <>Added <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} /> to timeline as well</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-11-12'),
    changes: 'Certain buffs or debuffs now show in timeline.',
    contributors: [Chizu],
  },
  {
    date: new Date('2018-10-15'),
    changes: <>Added <SpellLink id={SPELLS.VILE_TAINT_TALENT.id} />, <SpellLink id={SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.id} /> and <SpellLink id={SPELLS.SHADOW_EMBRACE_TALENT.id} /> modules.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-10-08'),
    changes: <>Added simple <SpellLink id={SPELLS.NIGHTFALL_TALENT.id} />, <SpellLink id={SPELLS.DRAIN_SOUL_TALENT.id} /> and <SpellLink id={SPELLS.PHANTOM_SINGULARITY_TALENT.id} /> modules.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-09-30'),
    changes: <>Added <SpellLink id={SPELLS.SUMMON_DARKGLARE.id} /> module.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-09-21'),
    changes: 'Grouped dot uptimes and talents into their respective statistic boxes.',
    contributors: [Chizu],
  },
  {
    date: new Date('2018-09-21'),
    changes: 'Removed all legendaries and tier set modules.',
    contributors: [Chizu],
  },
  {
    date: new Date('2018-09-20'),
    changes: <>Added <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} icon /> uptime module and added it into Checklist.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-09-20'),
    changes: <>Added <SpellLink id={SPELLS.DEATHBOLT_TALENT.id} icon /> module and made updates to <SpellLink id={SPELLS.HAUNT_TALENT.id} icon /> module.</>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-06-22'),
    changes: 'Updated the basics of the spec for BFA.',
    contributors: [Chizu],
  },
];
