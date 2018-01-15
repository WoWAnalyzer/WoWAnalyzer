import React from 'react';

import { Iskalla, Gebuz } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  { 
    date: new Date('2018-1-13'),
    changes: <Wrapper>Added L90 talents Astral Power gains.</Wrapper>,
    contributors: [Gebuz],
  },
  { 
    date: new Date('2018-1-13'),
    changes: <Wrapper>Added tier 20.</Wrapper>,
    contributors: [Gebuz],
  },
  { 
    date: new Date('2018-1-6'),
    changes: <Wrapper>Added tier 21.</Wrapper>,
    contributors: [Gebuz],
  },
  { 
    date: new Date('2018-1-5'),
    changes: <Wrapper>Added the following legendaries: <ItemLink id={ITEMS.IMPECCABLE_FEL_ESSENCE.id} icon />, <ItemLink id={ITEMS.ONETHS_INTUITION.id} icon />, <ItemLink id={ITEMS.LADY_AND_THE_CHILD.id} icon />, <ItemLink id={ITEMS.PROMISE_OF_ELUNE.id} icon />, and <ItemLink id={ITEMS.SOUL_OF_THE_ARCHDRUID.id} icon /> and updated <ItemLink id={ITEMS.THE_EMERALD_DREAMCATCHER.id} icon />.</Wrapper>,
    contributors: [Gebuz],
  },
  { 
    date: new Date('2018-1-2'),
    changes: <Wrapper>Added Astral Power usage tab.</Wrapper>,
    contributors: [Gebuz],
  },
  {
    date: new Date('2017-12-29'),
    changes: <Wrapper>Added Checklist.</Wrapper>,
    contributors: [Gebuz],
  },
  {
    date: new Date('2017-12-29'),
    changes: <Wrapper>Added all spells to Cast efficiency.</Wrapper>,
    contributors: [Gebuz],
  },
  {
    date: new Date('2017-12-28'),
    changes: <Wrapper>Added cooldown thoughtput tracker.</Wrapper>,
    contributors: [Gebuz],
  },
  {
    date: new Date('2017-9-28'),
    changes: <Wrapper>Added a tracker module for <ItemLink id={ITEMS.THE_EMERALD_DREAMCATCHER.id} icon />.</Wrapper>,
    contributors: [Iskalla],
  },
  {
    date: new Date('2017-9-22'),
    changes: <Wrapper>Added Overcapped Lunar and Solar empowerments modules.</Wrapper>,
    contributors: [Iskalla],
  },
  {
    date: new Date('2017-9-20'),
    changes: <Wrapper>Minor fixes to Unempowered <SpellLink id={SPELLS.LUNAR_STRIKE.id} icon /> module.</Wrapper>,
    contributors: [Iskalla],
  },
  {
    date: new Date('2017-9-12'),
    changes: <Wrapper>Added a module to track Unempowered <SpellLink id={SPELLS.LUNAR_STRIKE.id} icon /> casts.</Wrapper>,
    contributors: [Iskalla],
  },
  {
    date: new Date('2017-9-12'),
    changes: <Wrapper>Added the Damage module and Reorder of Stat boxes.</Wrapper>,
    contributors: [Iskalla],
  },
  {
    date: new Date('2017-9-12'),
    changes: <Wrapper>Minor text fixes.</Wrapper>,
    contributors: [Iskalla],
  },
  {
    date: new Date('2017-9-07'),
    changes: <Wrapper>Fixed stackable buffs - Now the ABC module should be more reliable.</Wrapper>,
    contributors: [Iskalla],
  },
  {
    date: new Date('2017-9-05'),
    changes: <Wrapper>Added Moon spells casted module.</Wrapper>,
    contributors: [Iskalla],
  },
  {
    date: new Date('2017-9-04'),
    changes: <Wrapper>Added wasted Astral Power module.</Wrapper>,
    contributors: [Iskalla],
  },
  {
    date: new Date('2017-9-02'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.MOONFIRE_BEAR.id} icon /> and <SpellLink id={SPELLS.SUNFIRE.id} icon /> uptime modules.</Wrapper>,
    contributors: [Iskalla],
  },
  {
    date: new Date('2017-8-30'),
    changes: <Wrapper>Added support.</Wrapper>,
    contributors: [Iskalla],
  },
];
