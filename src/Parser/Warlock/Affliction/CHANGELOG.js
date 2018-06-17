import React from 'react';

import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { Chizu, Zerotorescue } from 'CONTRIBUTORS';

export default [
  {
    date: new Date('2018-01-28'),
    changes: 'Upgrade the spec completeness to Great!',
    contributors: [Chizu],
  },
  {
    date: new Date('2018-01-28'),
    changes: 'Updated the thresholds for DOTs to be more strict.',
    contributors: [Chizu],
  },
  {
    date: new Date('2018-01-27'),
    changes: <React.Fragment>Updated the Checklist to show a Rule about buffing <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} icon />, low mana Rule and also refined some texts.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-01-25'),
    changes: 'Added a statistic box with information about Tormented Souls generation and merged the time spent on max stacks into it.',
    contributors: [Chizu],
  },
  {
    date: new Date('2018-01-24'),
    changes: <React.Fragment>Updated some thresholds, added <SpellLink id={SPELLS.SOUL_CONDUIT_TALENT.id} icon /> statistic box and reworked the module that showed how much you buffed your <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} icon />.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-01-23'),
    changes: 'Implemented Tier 21 set bonuses.',
    contributors: [Chizu],
  },
  {
    date: new Date('2017-12-29'),
    changes: 'Fixed display in the timeline and the inclusion in active time of channeled abilities.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-12-29'),
    changes: 'Implemented the Checklist.',
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-16'),
    changes: 'Added Summon Doomguard/Summon Infernal/Grimoire of Service to Cooldowns tab.',
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-09'),
    changes: 'Added Empowered Life Tap module.',
    contributors: [Chizu],
  },
  {
    date: new Date('2017-08-27'),
    changes: <React.Fragment>Reworked the <SpellLink id={SPELLS.DRAIN_SOUL.id} icon />/<SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} icon /> sniping module to provide more relevant info.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-08-24'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.DRAIN_SOUL.id} icon />/<SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} icon /> sniping module.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-08-21'),
    changes: <React.Fragment>Added rest of the legendaries (apart from <ItemLink id={ITEMS.HOOD_OF_ETERNAL_DISDAIN.id} icon />), some ToS trinkets and T20 set bonuses.</React.Fragment>,
    contributors: [Chizu],
  },
];
