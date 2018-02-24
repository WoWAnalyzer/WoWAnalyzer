import React from 'react';

import Wrapper from 'common/Wrapper';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { Blazballs, JLassie82, Putro } from 'MAINTAINERS';

export default [
  {
    date: new Date('2018-02-19'),
    changes: 'Spring cleaning in many modules. Added icons to Vulnerable Applications and Focus Usage modules, added a breakdown of which casts were cancelled',
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-05'),
    changes: <Wrapper>Added additional information to the <ItemLink id={ITEMS.CALL_OF_THE_WILD.id} icon /> module, to show cooldown reduction on the various affected spells. </Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-30'),
    changes: 'Added a tooltip on the focus usage chart that shows focus used aswell as amount of casts of the the given ability',
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-05'),
    changes: <Wrapper>Added support for <SpellLink id={SPELLS.SENTINEL_TALENT.id} icon />, and included the current bugged ticks of <SpellLink id={SPELLS.SENTINEL_TALENT.id} icon />.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-30'),
    changes: 'Fixed a bug in the focus chart, that sometimes indicated you were at negative focus at any given moment',
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-26'),
    changes: 'Added a focus usage chart',
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-26'),
    changes: <Wrapper>Added support for <ItemLink id={ITEMS.CELERITY_OF_THE_WINDRUNNERS.id} icon />, <ItemLink id={ITEMS.MAGNETIZED_BLASTING_CAP_LAUNCHER.id} icon />, <ItemLink id={ITEMS.ZEVRIMS_HUNGER.id} icon />, <ItemLink id={ITEMS.ROOTS_OF_SHALADRASSIL.id} icon />, <ItemLink id={ITEMS.CALL_OF_THE_WILD.id} icon />, <ItemLink id={ITEMS.THE_APEX_PREDATORS_CLAW.id} icon /> and <ItemLink id={ITEMS.THE_SHADOW_HUNTERS_VOODOO_MASK.id} icon />.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-26'),
    changes: 'Fix a bug with critical strike rating showing 5% too low for Marksmanship hunters.',
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-24'),
    changes: 'Updated to the new checklist format',
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-15'),
    changes: 'Reworked T21 almost from the ground up, the 4p now includes damage and procs',
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-04'),
    changes: 'Added many talents and traits. Moved them into a singular box to improve visibility.',
    contributors: [Putro],
  },
  {
    date: new Date('2017-11-29'),
    changes: 'Upgraded spec completeness to great.',
    contributors: [Putro],
  },
  {
    date: new Date('2017-11-29'),
    changes: <Wrapper>Updated <SpellLink id={SPELLS.TRICK_SHOT_TALENT.id} icon /> to properly account for both single-target and cleave damage, added support for tier 21, and fixed a bug in the <SpellLink id={SPELLS.TRUESHOT.id} icon /> module where it counted too many <SpellLink id={SPELLS.AIMED_SHOT.id} icon /> than it should.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-11-17'),
    changes: 'Updated changelog to new format.',
    contributors: [Putro],
  },
  {
    date: new Date('2017-11-12'),
    changes: 'Upgraded spec completeness to good.',
    contributors: [Putro],
  },
  {
    date: new Date('2017-11-12'),
    changes: 'Updated config information.',
    contributors: [Putro],
  },
  {
    date: new Date('2017-11-12'),
    changes: <Wrapper>Added a suggestion for execute trueshots and a <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} icon /> suggestion when boss has between 25 and 20% hp, so the player can better utilise <SpellLink id={SPELLS.BULLSEYE_BUFF.id} icon />.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-11-08'),
    changes: 'Added cancelled cast module.',
    contributors: [Putro],
  },
  {
    date: new Date('2017-11-08'),
    changes: 'Fixed large FocusChart performance bugs.',
    contributors: [Blazballs],
  },
  {
    date: new Date('2017-11-03'),
    changes: <Wrapper>Minor update to the <SpellLink id={SPELLS.LOCK_AND_LOAD_TALENT.id} icon /> module and its calculation of expected procs.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-25'),
    changes: <Wrapper> Added 5 new talent modules (<SpellLink id={SPELLS.EXPLOSIVE_SHOT_TALENT.id} icon />, <SpellLink id={SPELLS.PIERCING_SHOT_TALENT.id} icon />, <SpellLink id={SPELLS.VOLLEY_ACTIVATED.id} icon />, <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} icon />, <SpellLink id={SPELLS.TRICK_SHOT_TALENT.id} icon />), fixed <SpellLink id={SPELLS.TRUESHOT.id} icon /> CD, added Focus Dump Checker.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-25'),
    changes: <Wrapper>Updated <SpellLink id={SPELLS.TRUE_AIM_TALENT.id} icon /> to include damage contributed information.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-25'),
    changes: <Wrapper> Adjust <SpellLink id={SPELLS.HUNTER_MM_T20_2P_BONUS.id} icon /> to account for nerfs.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-22'),
    changes: <Wrapper>Updated suggestions overall, added avatar, removed <SpellLink id={SPELLS.CYCLONIC_BURST_IMPACT_TRAIT.id} icon /> from cooldown tracker, added suggestion to TimeFocusCapped, updated AlwaysBeCasting and CastEfficiency.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-22'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.TRUESHOT.id} icon /> statistic with average <SpellLink id={SPELLS.AIMED_SHOT.id} icon /> per <SpellLink id={SPELLS.TRUESHOT.id} icon />, and average starting focus per <SpellLink id={SPELLS.TRUESHOT.id} icon />.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-22'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.HUNTER_MM_T20_2P_BONUS.id} icon /> dmg increase breakdown.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-22'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.SOUL_OF_THE_HUNTMASTER.id} icon />, <ItemLink id={ITEMS.MKII_GYROSCOPIC_STABILIZER.id} icon /> and <ItemLink id={ITEMS.WAR_BELT_OF_THE_SENTINEL_ARMY.id} icon />support.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-20'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.TARNISHED_SENTINEL_MEDALLION.id} icon /> and <SpellLink id={SPELLS.TRUESHOT.id} icon /> pairing tooltip.</Wrapper>,
    contributors: [Blazballs],
  },
  {
    date: new Date('2017-10-20'),
    changes: <Wrapper> Added <SpellLink id={SPELLS.TRUE_AIM_TALENT.id} icon /> and <SpellLink id={SPELLS.LOCK_AND_LOAD_TALENT.id} icon /> support.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-16'),
    changes: <Wrapper> Added <ItemLink id={ITEMS.ULLRS_FEATHER_SNOWSHOES.id} icon /> to account for the <SpellLink id={SPELLS.TRUESHOT.id} icon />CDR it provides.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-16'),
    changes: <Wrapper> Added <SpellLink id={SPELLS.HUNTER_MM_T19_2P_BONUS.id} icon /> support.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-14'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.PATIENT_SNIPER_TALENT.id} icon /> tracking.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-14'),
    changes: 'Added Focus Capped Statistic Box.',
    contributors: [Blazballs],
  },
  {
    date: new Date('2017-10-08'),
    changes: 'Added FocusTracker Module and FocusTracker Graph module and additional supporting modules.',
    contributors: [Blazballs],
  },
  {
    date: new Date('2017-10-05'),
    changes: <Wrapper> remove <SpellLink id={SPELLS.CYCLONIC_BURST_TRAIT.id} icon /> from Cooldown view.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-05'),
    changes: <Wrapper> Added <SpellLink id={SPELLS.QUICK_SHOT_TRAIT.id} icon /> reduction for <SpellLink id={SPELLS.TRUESHOT.id} icon />.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-04'),
    changes: <Wrapper> Added <SpellLink id={SPELLS.AIMED_SHOT.id} icon /> and <SpellLink id={SPELLS.VULNERABLE.id} icon /> tracker.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-03'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.HUNTER_MM_T20_2P_BONUS.id} icon /> and <SpellLink id={SPELLS.HUNTER_MM_T20_4P_BONUS.id} icon /> support.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('02-10-2017'),
    changes: <Wrapper> Added <SpellLink id={SPELLS.BULLSEYE_BUFF.id} icon /> buff to hunter_spells for future usage.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-02'),
    changes: 'Changed dead time to stricter, and get the player to cast more (should generally always be casting something).',
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-02'),
    changes: <Wrapper>Added suggestions to <SpellLink id={SPELLS.WINDBURST.id} icon /> and <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} icon /> under CastEfficiency.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-02'),
    changes: 'Updated CastEfficiency to not show a lot of useless utility spells, unless they were specifically cast during that fight.',
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-02'),
    changes: 'Added spec info aswell as spec discussion URL + some basic rotational information while the modules aren\'t completed.',
    contributors: [Putro],
  },
  {
    date: new Date('2017-09-26'),
    changes: <Wrapper>Fixed Cooldown to not include <SpellLink id={SPELLS.WINDBURST_MOVEMENT_SPEED.id} icon /> buff.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-09-05'),
    changes: 'Base files added.',
    contributors: [JLassie82],
  },
];
