import React from 'react';

import Wrapper from 'common/Wrapper';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { Chizu, Zerotorescue } from 'MAINTAINERS';

export default [
  {
    date: new Date('2018-01-28'),
    changes: <Wrapper>Upgrade the spec completeness to Great!</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-01-28'),
    changes: <Wrapper>Updated the thresholds for DOTs to be more strict.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-01-27'),
    changes: <Wrapper>Updated the Checklist to show a Rule about buffing <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} icon/>, low mana Rule and also refined some texts.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-01-25'),
    changes: <Wrapper>Added a statistic box with information about <SpellLink id={SPELLS.WARLOCK_TORMENTED_SOULS.id} icon /> generation and merged the time spent on max stacks into it.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-01-24'),
    changes: <Wrapper>Updated some thresholds, added <SpellLink id={SPELLS.SOUL_CONDUIT_TALENT.id} icon/> statistic box and reworked the module that showed how much you buffed your <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} icon/>.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-01-23'),
    changes: <Wrapper>Implemented Tier 21 set bonuses.</Wrapper>,
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
    changes: <Wrapper>Added <SpellLink id={SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id} icon/>/<SpellLink id={SPELLS.SUMMON_INFERNAL_UNTALENTED.id} icon/>/<SpellLink id={SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id} icon/> to Cooldowns tab.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-09'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.EMPOWERED_LIFE_TAP_TALENT.id} icon/> module.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-08-27'),
    changes: <Wrapper>Reworked the <SpellLink id={SPELLS.DRAIN_SOUL.id} icon/>/<SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} icon/> sniping module to provide more relevant info.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-08-24'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.DRAIN_SOUL.id} icon/>/<SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} icon/> sniping module.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-08-21'),
    changes: <Wrapper>Added rest of the legendaries (apart from <ItemLink id={ITEMS.HOOD_OF_ETERNAL_DISDAIN.id} icon/>), some ToS trinkets and T20 set bonuses.</Wrapper>,
    contributors: [Chizu],
  },
];
