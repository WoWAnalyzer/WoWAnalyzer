import React from 'react';

import { Bonebasher , Gebuz, Khazak } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
    {
      date: new Date('2018-02-11'),
      changes: <Wrapper>Added stat box for <SpellLink id={SPELLS.GATHERING_STORM_TALENT.id} icon /></Wrapper>,
      contributors: [Khazak],
    },
    {
      date: new Date('2018-02-11'),
      changes: <Wrapper>Added stats for <ItemLink id={ITEMS.TORAVONS_WHITEOUT_BINDINGS.id}/> </Wrapper>,
      contributors: [Khazak],
    },
    {
      date: new Date('2018-01-30'),
      changes: <Wrapper>Added stats for <SpellLink id={SPELLS.FROST_DEATH_KNIGHT_T21_2SET_BONUS.id} icon /> and <SpellLink id={SPELLS.FROST_DEATH_KNIGHT_T21_4SET_BONUS.id} icon /> </Wrapper>,
      contributors: [Khazak],
    },
    {
      date: new Date('2018-01-29'),
      changes: 'Added overcapped Runes',
      contributors: [Gebuz],
    },
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
      changes: 'Feedback implemented.',
      contributors: [Bonebasher],
    },
    {
      date: new Date('2017-10-31'),
      changes: 'Added initial Frost support.',
      contributors: [Bonebasher],
    },
];