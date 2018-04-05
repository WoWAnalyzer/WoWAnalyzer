import React from 'react';

import { Bicepspump, Khazak, Gebuz, Hewhosmites } from 'CONTRIBUTORS';
import Wrapper from 'common/Wrapper';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default  [
  {
    date: new Date('2018-03-26'),
    changes: 'Updated Runic Power tracker for better accuracy',
    contributors: [Khazak],
  },
  {
    date: new Date('2018-03-03'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id} icon/></Wrapper>,
    contributors: [Hewhosmites],
  },
  {
    date: new Date('2018-01-30'),
    changes: 'Added overcapped Runes',
    contributors: [Gebuz],
  },
  {
    date: new Date('2018-1-1'),
    changes: 'Added Runic Power pooled before Dark Arbiter statistic',
    contributors: [Bicepspump],
  },
  {
    date: new Date('2018-1-1'),
    changes: 'Added wounds popped with Apocalypse statistic',
    contributors: [Bicepspump],
  },
  {
    date: new Date('2017-12-24'),
    changes: 'Added Checklist',
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
    changes: <Wrapper><SpellLink id={SPELLS.SCOURGE_OF_WORLDS.id} icon />, <ItemLink id={ITEMS.COLD_HEART.id} icon />, and <SpellLink id={SPELLS.UNHOLY_FRENZY_BUFF.id} /> trackers added</Wrapper>,
    contributors: [Khazak],
  },
  {
    date: new Date('2017-11-02'),
    changes: 'Cast efficiency fixes',
    contributors: [Khazak],
  },
  {
    date: new Date('2017-11-01'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.DARK_ARBITER_TALENT.id} icon /> Module</Wrapper>,
    contributors: [Khazak],
  },
  {
    date: new Date('2017-10-22'),
    changes: 'Added initial Unholy support',
    contributors: [Khazak],
  },
];
