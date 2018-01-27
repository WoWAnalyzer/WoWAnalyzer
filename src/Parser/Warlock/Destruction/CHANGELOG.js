import React from 'react';

import { Chizu } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-01-26'),
    changes: <Wrapper>Implemented Tier 21 set bonuses.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-16'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id} icon/>/<SpellLink id={SPELLS.SUMMON_INFERNAL_UNTALENTED.id} icon/>/<SpellLink id={SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id} icon/> to Cooldowns tab.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-12'),
    changes: <Wrapper>Added Legendaries and T20 2set.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-10'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.CHANNEL_DEMONFIRE_TALENT.id} icon/> and <SpellLink id={SPELLS.HAVOC.id} icon/> cleave module (not 100% accurate though).</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-10'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.FIRE_AND_BRIMSTONE_TALENT.id} icon/> cleave and fragment tracker.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-10'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.DIMENSIONAL_RIFT_CAST.id} icon/> damage tracker.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-09'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.REVERSE_ENTROPY_TALENT.id} icon/>, <SpellLink id={SPELLS.ERADICATION_TALENT.id} icon/> and <SpellLink id={SPELLS.EMPOWERED_LIFE_TAP_TALENT.id}/> modules.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-08'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.BACKDRAFT_TALENT.id} icon/>, <SpellLink id={SPELLS.ROARING_BLAZE_TALENT.id} icon/> and <SpellLink id={SPELLS.SHADOWBURN_TALENT.id} icon/> modules.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-07'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.IMMOLATE_DEBUFF.id} icon/> uptime tracker.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-05'),
    changes: <Wrapper>Added Soul Shard usage breakdown.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-04'),
    changes: <Wrapper>Fixed the issues with <SpellLink id={SPELLS.GRIMOIRE_OF_SERVICE_TALENT.id} icon/> and <SpellLink id={SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id} icon/>/<SpellLink id={SPELLS.SUMMON_INFERNAL_UNTALENTED.id} icon/>.</Wrapper>,
    contributors: [Chizu],
  },
];
