import React from 'react';

import { Chizu } from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

export default [
  {
    date: new Date('2018-09-26'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.SUMMON_DARKGLARE.id} /> module.</React.Fragment>,
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
    changes: <React.Fragment>Added <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} icon /> uptime module and added it into Checklist.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-09-20'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.DEATHBOLT_TALENT.id} icon /> module and made updates to <SpellLink id={SPELLS.HAUNT_TALENT.id} icon /> module.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-06-22'),
    changes: 'Updated the basics of the spec for BFA.',
    contributors: [Chizu],
  },
];
