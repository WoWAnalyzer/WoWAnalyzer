import React from 'react';

import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { Chizu, Zerotorescue } from 'CONTRIBUTORS';

export default [
  {
    date: new Date('2018-01-28'),
    changes: <React.Fragment>Upgrade the spec completeness to Great!</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-01-28'),
    changes: <React.Fragment>Updated the thresholds for DOTs to be more strict.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-01-27'),
    changes: <React.Fragment>Updated the Checklist to show a Rule about buffing <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} icon />, low mana Rule and also refined some texts.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-01-25'),
    changes: <React.Fragment>Added a statistic box with information about <SpellLink id={SPELLS.WARLOCK_TORMENTED_SOULS.id} /> generation and merged the time spent on max stacks into it.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-01-24'),
    changes: <React.Fragment>Updated some thresholds, added <SpellLink id={SPELLS.SOUL_CONDUIT_TALENT.id} icon /> statistic box and reworked the module that showed how much you buffed your <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} icon />.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-01-23'),
    changes: <React.Fragment>Implemented Tier 21 set bonuses.</React.Fragment>,
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
    changes: <React.Fragment>Added <SpellLink id={SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id} icon />/<SpellLink id={SPELLS.SUMMON_INFERNAL_UNTALENTED.id} icon />/<SpellLink id={SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id} icon /> to Cooldowns tab.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-09'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.EMPOWERED_LIFE_TAP_TALENT.id} icon /> module.</React.Fragment>,
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
