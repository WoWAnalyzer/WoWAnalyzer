import React from 'react';

import { Sharrq, sref } from 'CONTRIBUTORS';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';

export default [
  {
    date: new Date('2018-01-27'),
    changes: <Wrapper>Marked spec completeness as Great!</Wrapper>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-01-01'),
    changes: <Wrapper>Added a 'Fish for procs' entry to the Checklist, and reworded/updated several suggestion metrics.</Wrapper>,
    contributors: [sref],
  },
  {
    date: new Date('2017-12-29'),
    changes: <Wrapper>Added support for <SpellLink id={SPELLS.FROST_MAGE_T21_4SET_BONUS_BUFF.id} icon /></Wrapper>,
    contributors: [sref],
  },
  {
    date: new Date('2017-12-27'),
    changes: 'Converted Changelog to new format',
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-12-24'),
    changes: 'Added Checklist',
    contributors: [sref],
  },
  {
    date: new Date('2017-12-01'),
    changes: <Wrapper>Added support for <SpellLink id={SPELLS.FROST_MAGE_T21_2SET_BONUS_BUFF.id} icon /></Wrapper>,
    contributors: [sref],
  },
  {
    date: new Date('2017-11-04'),
    changes: <Wrapper>Reworked and updated <SpellLink id={SPELLS.GLACIAL_SPIKE_DAMAGE.id} icon /> module</Wrapper>,
    contributors: [sref],
  },
  {
    date: new Date('2017-11-04'),
    changes: <Wrapper>Added support for <SpellLink id={SPELLS.FROST_MAGE_T20_4SET_BONUS_BUFF.id} icon /></Wrapper>,
    contributors: [sref],
  },
  {
    date: new Date('2017-11-04'),
    changes: <Wrapper>Added support for <ItemLink id={ITEMS.ICE_TIME.id} icon /> and <ItemLink id={ITEMS.LADY_VASHJS_GRASP.id} icon /> Legendaries</Wrapper>,
    contributors: [sref],
  },
  {
    date: new Date('2017-10-30'),
    changes: 'Added Cancelled Casts module',
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-10-29'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.ICE_LANCE.id} icon /> Utilization module</Wrapper>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-10-28'),
    changes: <Wrapper>Enhanced display of <SpellLink id={SPELLS.WINTERS_CHILL.id} icon /> and <SpellLink id={SPELLS.BRAIN_FREEZE.id} icon /> statistics</Wrapper>,
    contributors: [sref],
  },
  {
    date: new Date('2017-10-28'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.SPLITTING_ICE_TALENT.id} icon /> module</Wrapper>,
    contributors: [sref],
  },
  {
    date: new Date('2017-10-17'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.FROST_BOMB_TALENT.id} icon />, <SpellLink id={SPELLS.UNSTABLE_MAGIC_TALENT.id} icon />, and <SpellLink id={SPELLS.ARCTIC_GALE_TALENT.id} icon /> modules</Wrapper>,
    contributors: [sref],
  },
  {
    date: new Date('2017-10-17'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.RUNE_OF_POWER_BUFF.id} icon /> and <SpellLink id={SPELLS.MIRROR_IMAGE_SUMMON.id} icon /> modules</Wrapper>,
    contributors: [sref],
  },
  {
    date: new Date('2017-10-16'),
    changes: <Wrapper>Added Cooldown Reduction Tracking for <SpellLink id={SPELLS.FROZEN_ORB.id} icon /> and <SpellLink id={SPELLS.ICY_VEINS.id} icon /></Wrapper>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-10-15'),
    changes: <Wrapper>Added Support for <ItemLink id={ITEMS.ZANNESU_JOURNEY.id} icon />, <ItemLink id={ITEMS.MAGTHERIDONS_BANISHED_BRACERS.id} icon />, and <ItemLink id={ITEMS.SHATTERED_FRAGMENTS_OF_SINDRAGOSA.id} icon /></Wrapper>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-10-08'),
    changes: 'Added spec',
    contributors: [Sharrq],
  },
];
