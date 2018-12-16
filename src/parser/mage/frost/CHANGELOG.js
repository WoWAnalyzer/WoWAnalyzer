import React from 'react';

import { Sharrq, Dambroda, jos3p } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-11-27'),
    changes: <>Removed <SpellLink id={SPELLS.THERMAL_VOID_TALENT.id} /> from checklist and updated the module to better show what the talent provides.</>,
    contributors: [Dambroda],
  },
  {
    date: new Date('2018-11-24'),
    changes: <>Added a statistics module for <SpellLink id={SPELLS.LONELY_WINTER_TALENT.id} />.</>,
    contributors: [Dambroda],
  },
  {
    date: new Date('2018-11-18'),
    changes: <>Removed <SpellLink id={SPELLS.BONE_CHILLING_TALENT.id} /> uptime from checklist and updated the module to calculate damage instead of uptime.</>,
    contributors: [Dambroda],
  },
  {
    date: new Date('2018-10-29'),
    changes: <>Rewrote <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> module. Inefficient casts are now shown in timeline.</>,
    contributors: [Dambroda],
  },
  {
    date: new Date('2018-10-28'),
    changes: <>Added statistics and checklist entry for <SpellLink id={SPELLS.SUMMON_WATER_ELEMENTAL.id} /> if talented.</>,
    contributors: [jos3p],
  },
  {
    date: new Date('2018-09-21'),
    changes: <>Added statistics for <SpellLink id={SPELLS.WHITEOUT.id} /></>,
    contributors: [Dambroda],
  },
  {
    date: new Date('2018-09-10'),
    changes: <>Updated Checklist, Better <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> Support, Added Support for <SpellLink id={SPELLS.BONE_CHILLING_TALENT.id} /></>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-28'),
    changes: <>Added support for Winter's Reach and <SpellLink id={SPELLS.WHITEOUT.id} /></>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-11'),
    changes: <>Updated for Level 120</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-06-10'),
    changes: <>Updated for 8.0 Prepatch</>,
    contributors: [Sharrq],
  },
];
