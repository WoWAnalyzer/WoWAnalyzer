import React from 'react';

import { Bonebasher } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
    {
      date: new Date('2017-11-07'),
      changes: <Wrapper>Added <SpellLink id={SPELLS.BREATH_OF_SINDRAGOSA_TALENT.id} icon /> and <SpellLink id={SPELLS.INEXORABLE_ASSAULT_TALENT.id} icon /> talent support; changed extra info.</Wrapper>,
      contributors: [Bonebasher],
    },
    {
      date: new Date('2017-11-02'),
      changes: <Wrapper>Artifact ability cooldown changed, <ItemLink id={ITEMS.COLD_HEART.id} icon /> added, Added folder for shared coding between specs.</Wrapper>,
      contributors: [Bonebasher],
    },
    {
      date: new Date('2017-11-01'),
      changes: <Wrapper>Feedback implemented.</Wrapper>,
      contributors: [Bonebasher],
    },
    {
      date: new Date('2017-10-31'),
      changes: <Wrapper>Added initial Frost support.</Wrapper>,
      contributors: [Bonebasher],
    },
];

