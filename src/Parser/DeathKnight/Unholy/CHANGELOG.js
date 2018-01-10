import React from 'react';

import { Khazak } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default  [
  {
    date: new Date('2017-12-24'),
    changes: <Wrapper>Added Checklist</Wrapper>,
    contributors: [Khazak],
  },
  {
    date: new Date('2017-12-15'),
    changes: <Wrapper>Removed <SpellLink id={SPELLS.SCOURGE_OF_WORLDS.id} icon /> tracker after feedback</Wrapper>,
    contributors: [Khazak],
  },
  {
    date: new Date('2017-12-14'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.UNHOLY_DEATH_KNIGHT_T21_2SET_BONUS.id} icon /> and <SpellLink id={SPELLS.UNHOLY_DEATH_KNIGHT_T21_4SET_BONUS.id} icon /></Wrapper>,
    contributors: [Khazak],
  },
  {
    date: new Date('2017-11-14'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.UNHOLY_DEATH_KNIGHT_T20_2SET_BONUS.id} icon /> tracking</Wrapper>,
    contributors: [Khazak],
  },
  {
    date: new Date('2017-11-04'),
    changes: <Wrapper><SpellLink id={SPELLS.SCOURGE_OF_WORLDS.id} icon />, <ItemLink id={ITEMS.COLD_HEART.id} icon />, and <SpellLink id={SPELLS.UNHOLY_FRENZY_BUFF.id} icon /> trackers added</Wrapper>,
    contributors: [Khazak],
  },
  {
    date: new Date('2017-11-02'),
    changes: <Wrapper>Cast efficiency fixes</Wrapper>,
    contributors: [Khazak],
  },
  {
    date: new Date('2017-11-01'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.DARK_ARBITER_TALENT.id} icon /> Module</Wrapper>,
    contributors: [Khazak],
  },
  {
    date: new Date('2017-10-22'),
    changes: <Wrapper>Added initial Unholy support</Wrapper>,
    contributors: [Khazak],
  },
];
