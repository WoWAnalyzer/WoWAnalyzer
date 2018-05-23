import React from 'react';

import { Bicepspump, Khazak, Gebuz, Hewhosmites } from 'CONTRIBUTORS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-04-09'),
    changes: 'Added Rune efficiency to checklist',
    contributors: [Khazak],
  },
  {
    date: new Date('2018-03-26'),
    changes: 'Updated Runic Power tracker for better accuracy',
    contributors: [Khazak],
  },
  {
    date: new Date('2018-03-03'),
    changes: <React.Fragment>Added <ItemLink id={ITEMS.TAKTHERITRIXS_SHOULDERPADS.id} icon/></React.Fragment>,
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
    changes: <React.Fragment>Removed <SpellLink id={SPELLS.SCOURGE_OF_WORLDS.id} /> tracker after feedback</React.Fragment>,
    contributors: [Khazak],
  },
  {
    date: new Date('2017-12-14'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.UNHOLY_DEATH_KNIGHT_T21_2SET_BONUS.id} /> and <SpellLink id={SPELLS.UNHOLY_DEATH_KNIGHT_T21_4SET_BONUS.id} /></React.Fragment>,
    contributors: [Khazak],
  },
  {
    date: new Date('2017-11-14'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.UNHOLY_DEATH_KNIGHT_T20_2SET_BONUS.id} /> tracking</React.Fragment>,
    contributors: [Khazak],
  },
  {
    date: new Date('2017-11-04'),
    changes: <React.Fragment><SpellLink id={SPELLS.SCOURGE_OF_WORLDS.id} />, <ItemLink id={ITEMS.COLD_HEART.id} />, and <SpellLink id={SPELLS.UNHOLY_FRENZY_BUFF.id} /> trackers added</React.Fragment>,
    contributors: [Khazak],
  },
  {
    date: new Date('2017-11-02'),
    changes: 'Cast efficiency fixes',
    contributors: [Khazak],
  },
  {
    date: new Date('2017-11-01'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.DARK_ARBITER_TALENT.id} /> Module</React.Fragment>,
    contributors: [Khazak],
  },
  {
    date: new Date('2017-10-22'),
    changes: 'Added initial Unholy support',
    contributors: [Khazak],
  },
];
