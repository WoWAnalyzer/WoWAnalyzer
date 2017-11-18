import React from 'react';

import Wrapper from 'common/Wrapper';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import PutroAvatar from './Images/putro-avatar.png';


const Putro = ['Putro', PutroAvatar];

export default [
  {
    date: new Date('17-11-2017'),
    changes:'Updated changelog to new format.',
    contributors: [Putro],
  },
  {
    date: new Date('12-11-2017'),
    changes:'Upgraded spec completeness to good.',
    contributors: [Putro],
  },
  {
    date: new Date('12-11-2017'),
    changes:'Updated config information.',
    contributors: [Putro],
  },
  {
    date: new Date('12-11-2017'),
    changes:<Wrapper>Added a suggestion for execute trueshots and a <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id}/> suggestion when boss has between 25 and 20% hp, so the player can better utilise <SpellLink id={SPELLS.BULLSEYE_TRAIT.id}/>.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('08-11-2017'),
    changes:'Added cancelled cast module.',
    contributors: [Putro],
  },
  {
    date: new Date('08-11-2017'),
    changes:'Fixed large FocusChart performance bugs.',
    contributors: ['Leapis'],
  },
  {
    date: new Date('03-11-2017'),
    changes:<Wrapper>Minor update to the <SpellLink id={SPELLS.LOCK_AND_LOAD_TALENT.id}/> module and its calculation of expected procs.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('25-10-2017'),
    changes: <Wrapper> Added 5 new talent modules (<SpellLink id={SPELLS.EXPLOSIVE_SHOT_TALENT.id}/>, <SpellLink id={SPELLS.PIERCING_SHOT_TALENT.id}/>, <SpellLink id={SPELLS.VOLLEY_ACTIVATED.id}/>, <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id}/>, <SpellLink id={SPELLS.TRICK_SHOT_TALENT.id}/>), fixed <SpellLink id={SPELLS.TRUESHOT.id}/> CD, added Focus Dump Checker.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('25-10-2017'),
    changes:<Wrapper>Updated <SpellLink id={SPELLS.TRUE_AIM_TALENT.id}/> to include damage contributed information.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('25-10-2017'),
    changes:<Wrapper> Adjust <SpellLink id={SPELLS.HUNTER_MM_T20_2P_BONUS.id}/> to account for nerfs.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('22-10-2017'),
    changes:<Wrapper>Updated suggestions overall, added avatar, removed <SpellLink id={SPELLS.CYCLONIC_BURST_IMPACT_TRAIT.id}/> from cooldown tracker, added suggestion to TimeFocusCapped, updated AlwaysBeCasting and CastEfficiency.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('22-10-2017'),
    changes:<Wrapper>Added <SpellLink id={SPELLS.TRUESHOT.id}/> statistic with average <SpellLink id={SPELLS.AIMED_SHOT.id}/> pr <SpellLink id={SPELLS.TRUESHOT.id}/>, and average starting focus pr <SpellLink id={SPELLS.TRUESHOT.id}/>.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('22-10-2017'),
    changes:<Wrapper>Added <SpellLink id={SPELLS.HUNTER_MM_T20_2P_BONUS.id}/> dmg increase breakdown.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('22-10-2017'),
    changes:<Wrapper>Added <ItemLink id={ITEMS.SOUL_OF_THE_HUNTMASTER.id}/>, <ItemLink id={ITEMS.MKII_GYROSCOPIC_STABILIZER.id}/> and <ItemLink id={ITEMS.WAR_BELT_OF_THE_SENTINEL_ARMY.id}/>support.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('20-10-2017'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.TARNISHED_SENTINEL_MEDALLION.id}/> and <SpellLink id={SPELLS.TRUESHOT.id}/> pairing tooltip.</Wrapper>,
    contributors: ['Leapis'],
  },
  {
    date: new Date('20-10-2017'),
    changes: <Wrapper> Added <SpellLink id={SPELLS.TRUE_AIM_TALENT.id}/> and <SpellLink id={SPELLS.LOCK_AND_LOAD_TALENT.id}/> support.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('16-10-2017'),
    changes:<Wrapper> Added <ItemLink id={ITEMS.ULLRS_FEATHER_SNOWSHOES.id}/> to account for the <SpellLink id={SPELLS.TRUESHOT.id}/>CDR it provides.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('16-10-2017'),
    changes:<Wrapper> Added <SpellLink id={SPELLS.HUNTER_MM_T19_2P_BONUS.id}/> support.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('14-10-2017'),
    changes:<Wrapper>Added <SpellLink id={SPELLS.PATIENT_SNIPER_TALENT.id}/> tracking.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('14-10-2017'),
    changes:'Added Focus Capped Statistic Box.',
    contributors: ['Leapis'],
  },
  {
    date: new Date('08-10-2017'),
    changes:'Added FocusTracker Module and FocusTracker Graph module and additional supporting modules.',
    contributors: ['Leapis'],
  },
  {
    date: new Date('05-10-2017'),
    changes:<Wrapper> remove <SpellLink id={SPELLS.CYCLONIC_BURST_TRAIT.id}/> from Cooldown view.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('05-10-2017'),
    changes:<Wrapper> Added <SpellLink id={SPELLS.QUICK_SHOT_TRAIT.id}/> reduction for <SpellLink id={SPELLS.TRUESHOT.id}/>.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('04-10-2017'),
    changes:<Wrapper> Added <SpellLink id={SPELLS.AIMED_SHOT.id}/> and <SpellLink id={SPELLS.VULNERABLE.id}/> tracker.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('03-10-2017'),
    changes:<Wrapper>Added <SpellLink id={SPELLS.HUNTER_MM_T20_2P_BONUS.id}/> and <SpellLink id={SPELLS.HUNTER_MM_T20_4P_BONUS.id}/> support.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('02-10-2017'),
    changes:<Wrapper> Added <SpellLink id={SPELLS.BULLSEYE_TRAIT.id}/> buff to hunter_spells for future usage.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('02-10-2017'),
    changes:'Changed dead time to stricter, and get the player to cast more (should generally always be casting something).',
    contributors: [Putro],
  },
{
    date: new Date('02-10-2017'),
  changes:<Wrapper>Added suggestions to <SpellLink id={SPELLS.WINDBURST.id}/> and <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id}/> under CastEfficiency.</Wrapper>,
    contributors: [Putro],
  },

{
    date: new Date('02-10-2017'),
    changes:'Updated CastEfficiency to not show a lot of useless utility spells, unless they were specifically cast during that fight.',
    contributors: [Putro],
  },
{
    date: new Date('02-10-2017'),
    changes:'Added spec info aswell as spec discussion URL + some basic rotational information while the modules aren\'t completed.',
    contributors: [Putro],
  },

{
    date: new Date('26-09-2017'),
  changes:<Wrapper>Fixed Cooldown to not include <SpellLink id={SPELLS.WINDBURST_MOVEMENT_SPEED.id}/> buff.</Wrapper>,
    contributors: [Putro],
  },
{
    date: new Date('05-09-2017'),
    changes:'Base files added.',
    contributors: ['JLassie82'],
  },

];
