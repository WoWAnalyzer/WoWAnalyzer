import React from 'react';

import { Iskalla, Gebuz } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
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
