import React from 'react';

import { Hewhosmites, Zerotorescue } from 'CONTRIBUTORS';
import Wrapper from 'common/Wrapper';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemLink from 'common/ItemLink';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-03-15'),
    changes: <Wrapper>Implemented <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon />'s cooldown reduction of <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} icon />, making its cooldown indicator in the timeline accurate.</Wrapper>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-03-15'),
    changes: <Wrapper>Fixed <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon />'s cooldown to the proper 6 seconds before Haste.</Wrapper>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-03-14'),
    changes: <Wrapper>Added missing abilities, fixed some cooldowns and implemented <SpellLink id={SPELLS.RIGHTEOUS_PROTECTOR_TALENT.id} icon />.</Wrapper>,
    contributors: [Zerotorescue, Hewhosmites],
  },
  {
    date: new Date('2018-03-03'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.PILLARS_OF_INMOST_LIGHT.id} icon /></Wrapper>,
    contributors: [Hewhosmites],
  },
];
