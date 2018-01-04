import React from 'react';

import { Sharrq, sref } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
      date: new Date('2018-01-01'),
      changes: <Wrapper>Added a 'Fish for procs' entry to the Checklist, and reworded/updated several suggestion metrics.</Wrapper>,
      contributors: [sref],
  },
  {
      date: new Date('2017-12-29'),
      changes: <Wrapper>Added support for <SpellLink id={SPELLS.FROST_MAGE_T21_4SET_BONUS_BUFF.id} /></Wrapper>,
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
      changes: <Wrapper>Added support for <SpellLink id={SPELLS.FROST_MAGE_T21_2SET_BONUS_BUFF.id} /></Wrapper>,
      contributors: [sref],
  },
  {
      date: new Date('2017-11-04'),
      changes: 'Reworked and updated Glacial Spike module',
      contributors: [sref],
  },
  {
      date: new Date('2017-11-04'),
      changes: 'Added support for T20 4pc Bonus',
      contributors: [sref],
  },
  {
      date: new Date('2017-11-04'),
      changes: 'Added support for Ice Time and Lady Vashj\'s Grasp Legendaries',
      contributors: [sref],
  },
  {
      date: new Date('2017-10-30'),
      changes: 'Added Cancelled Casts module',
      contributors: [Sharrq],
  },
  {
      date: new Date('2017-10-29'),
      changes: 'Added Ice Lance Utilization module',
      contributors: [Sharrq],
  },
  {
      date: new Date('2017-10-28'),
      changes: 'Enhanced display of Winter\'s Chill and Brain Freeze statistics',
      contributors: [sref],
  },
  {
      date: new Date('2017-10-28'),
      changes: 'Added Splitting Ice module',
      contributors: [sref],
  },
  {
      date: new Date('2017-10-17'),
      changes: 'Added Frost Bomb, Unstable Magic, and Arctic Gale modules',
      contributors: [sref],
  },
  {
      date: new Date('2017-10-17'),
      changes: 'Added Rune of Power and Mirror Image modules',
      contributors: [sref],
  },
  {
      date: new Date('2017-10-16'),
      changes: 'Added Cooldown Reduction Tracking for Frozen Orb and Icy Veins',
      contributors: [Sharrq],
  },
  {
      date: new Date('2017-10-15'),
      changes: 'Added Support for Zann\'esu Journey, Magtheridon\'s Banished Bracers, and Shattered Fragments of Sindragosa',
      contributors: [Sharrq],
  },
  {
      date: new Date('2017-10-08'),
      changes: 'Added spec',
      contributors: [Sharrq],
  },
];
