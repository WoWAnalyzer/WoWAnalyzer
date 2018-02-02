import React from 'react';

import Wrapper from 'common/Wrapper';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { Chizu } from 'MAINTAINERS';

export default [
  {
    date: new Date('2017-09-30'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.KAZZAKS_FINAL_CURSE.id} icon/> and <ItemLink id={ITEMS.WILFREDS_SIGIL_OF_SUPERIOR_SUMMONING.id} icon/> modules.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-30'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.WAKENERS_LOYALTY.id} icon/>, <ItemLink id={ITEMS.RECURRENT_RITUAL.id} icon/>, <ItemLink id={ITEMS.SINDOREI_SPITE.id} icon/> modules.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-29'),
    changes: <Wrapper>Added T20 set bonuses.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-25'),
    changes: <Wrapper>Added rest of the talent modules - <SpellLink id={SPELLS.HAND_OF_DOOM_TALENT.id} icon/>, <SpellLink id={SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.id} icon/>, <SpellLink id={SPELLS.GRIMOIRE_OF_SYNERGY_TALENT.id} icon/>, <SpellLink id={SPELLS.SUMMON_DARKGLARE_TALENT.id} icon/> and <SpellLink id={SPELLS.DEMONBOLT_TALENT.id} icon/>.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-23'),
    changes: <Wrapper>Added second talent row modules - <SpellLink id={SPELLS.IMPENDING_DOOM_TALENT.id} icon/>, <SpellLink id={SPELLS.IMPROVED_DREADSTALKERS_TALENT.id} icon/> and <SpellLink id={SPELLS.IMPLOSION_TALENT.id} icon/>.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-19'),
    changes: <Wrapper>Added first talent row modules - <SpellLink id={SPELLS.SHADOWY_INSPIRATION_TALENT.id} icon/>, <SpellLink id={SPELLS.SHADOWFLAME_TALENT.id} icon/> and <SpellLink id={SPELLS.DEMONIC_CALLING_TALENT.id} icon/>.</Wrapper>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-19'),
    changes: <Wrapper>Added the Soul Shard tracker.</Wrapper>,
    contributors: [Chizu],
  },
];
