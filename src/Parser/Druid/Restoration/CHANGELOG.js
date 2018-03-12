import React from 'react';

import { blazyb, sref, Zerotorescue } from 'MAINTAINERS';

import Wrapper from 'common/Wrapper';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-02-11'),
    changes: <Wrapper>Fixed a bug that could cause incorrect proc counts and uptimes for players using <SpellLink id={SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id} icon /> and <ItemLink id={ITEMS.CHAMELEON_SONG.id} icon /> together.</Wrapper>,
    contributors: [sref],
  },
  {
    date: new Date('2018-02-03'),
    changes: 'Added a Checklist to the top of the page, which is a more organized and better explained version of the Suggestion system.',
    contributors: [sref],
  },
  {
    date: new Date('2018-02-02'),
    changes: <Wrapper>Fixed a bug in <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} icon /> Util module where overwritten procs weren't shown if player doesn't take <SpellLink id={SPELLS.MOMENT_OF_CLARITY_TALENT_RESTORATION.id} icon />.</Wrapper>,
    contributors: [sref],
  },
  {
    date: new Date('2018-01-26'),
    changes: <Wrapper>Updated HoT tracking framework to allow attribution of HoT extensions, allowing updates to <SpellLink id={SPELLS.FLOURISH_TALENT.id} icon />. Also added modules for <ItemLink id={ITEMS.EDRAITH_BONDS_OF_AGLAYA.id} icon />, <ItemLink id={ITEMS.AMANTHULS_WISDOM.id} icon />, and <SpellLink id={SPELLS.DEEP_ROOTED_TRAIT.id} icon />.</Wrapper>,
    contributors: [sref],
  },
  {
    date: new Date('2018-01-10'),
    changes: <Wrapper>Added framework for tracking HoT attribution, allowing updates to several modules: <ItemLink id={ITEMS.TEARSTONE_OF_ELUNE.id} icon />, <SpellLink id={SPELLS.POWER_OF_THE_ARCHDRUID.id} icon />, <SpellLink id={SPELLS.RESTO_DRUID_T21_2SET_BONUS_BUFF.id} icon />, and <SpellLink id={SPELLS.RESTO_DRUID_T21_4SET_BONUS_BUFF.id} icon />. Also added <SpellLink id={SPELLS.RESTO_DRUID_T19_4SET_BONUS_BUFF.id} icon />.</Wrapper>,
    contributors: [sref],
  },
  {
    date: new Date('2018-01-07'),
    changes: 'Clearcasting module now shows percent used instead of percent missed, tooltip updated, and now works with MoC',
    contributors: [sref],
  },
  {
    date: new Date('2017-12-24'),
    changes: 'Fixed crash with the new Insignia of the Grand Army module.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-12-07'),
    changes: 'Stat values show healing gained per 1 rating on hover.',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-12-05'),
    changes: 'Added throughput for some NLC traits.',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-10-23'),
    changes: 'Added Stat Weights calculator',
    contributors: [sref],
  },
  {
    date: new Date('2017-10-14'),
    changes: "Now uses the base Sephuz's Secret module, which displays average haste gained.",
    contributors: [sref],
  },
  {
    date: new Date('2017-10-06'),
    changes: 'Added Ironbark module.',
    contributors: [sref],
  },
  {
    date: new Date('2017-09-29'),
    changes: 'Flourish display updates.',
    contributors: [blazyb, sref],
  },
  {
    date: new Date('2017-09-26'),
    changes: 'Added suggestions for Soul of the Forest / Archdruid WG usage',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-09-23'),
    changes: 'Updated Mastery calculations to be less friendly to overhealing. Expect lower results from Cultivation, Cenarion Ward, Spring Blossoms, and 2PT19.',
    contributors: [sref],
  },
  {
    date: new Date('2017-09-22'),
    changes: 'Updated display of 2PT20 to show average refunded cooldown instead of throughput estimate.',
    contributors: [sref],
  },
  {
    date: new Date('2017-09-21'),
    changes: 'Minor bug fix to clearcasting module.',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-09-19'),
    changes: 'Added Average HoTs statistic',
    contributors: [sref],
  },
  {
    date: new Date('2017-09-18'),
    changes: "Added Essence of G'Hanir to the cooldowns tab",
    contributors: [blazyb],
  },
  {
    date: new Date('2017-09-07'),
    changes: 'Added relic traits module',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-09-07'),
    changes: "Added suggestion when high Nature's Essence overheal",
    contributors: [sref],
  },
  {
    date: new Date('2017-09-07'),
    changes: 'Added preliminary support for T21',
    contributors: [sref],
  },
  {
    date: new Date('2017-09-07'),
    changes: 'Activated low health healing module',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-09-07'),
    changes: 'Added suggestions for low healing from Cultivation and Spring Blossoms',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-09-04'),
    changes: 'Added Mastery calculations, with support for Spring Blossoms, Cenarion Ward, Cultivation, and the T19 2Set',
    contributors: [sref],
  },
  {
    date: new Date('2017-07-06'),
    changes: 'Added mana costs for spells, and the cooldown tab should now properly calculate mana costs',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-07-06'),
    changes: 'Fixed a bug in 4PT20 calculations, and added Swiftmend to the cast efficiency tab',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-06-23'),
    changes: "Added Essence of G'Hanir module",
    contributors: [blazyb],
  },
  {
    date: new Date('2017-06-20'),
    changes: 'Added Gnawed Thumb Ring module',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-06-16'),
    changes: 'Adjustments to DMD:Promises module',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-06-01'),
    changes: 'Updated T20 calculations based on PTR changes',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-05-30'),
    changes: 'Added Dreamwalker calculations (thanks @greatman)',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-05-30'),
    changes: 'Added SotF + SotA modules',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-05-26'),
    changes: 'Added non-healing time and downtime calculations',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-05-26'),
    changes: 'Added Chameleon Song module. Also updated Tree of Life module',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-05-25'),
    changes: 'Added T20 module',
    contributors: [blazyb],
  },
  {
    date: new Date('2017-05-21'),
    changes: 'Added Resto Druid Analyzer',
    contributors: [blazyb],
  },
];
