import React from 'react';

import { Zerotorescue } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-09-16'),
    changes: <>Added <SpellLink id={SPELLS.BEACON_OF_LIGHT_HEAL.id} /> healing lost from missing beacons as well as beacon line of sighting.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-09-15'),
    changes: <>Improved <SpellLink id={SPELLS.BEACON_OF_LIGHT_HEAL.id} /> transfer tracking accuracy when line of sighting beacon targets.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-09-15'),
    changes: <>Fixed a bug in <SpellLink id={SPELLS.BEACON_OF_LIGHT_HEAL.id} /> transfer tracking where line of sighting a beacon targets could lead to inaccurate results.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-09-15'),
    changes: <>Added a <SpellLink id={SPELLS.BEACON_OF_LIGHT_HEAL.id} /> transfer sources breakdown tab.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-09-15'),
    changes: <>Fixed a bug in the analysis of <SpellLink id={SPELLS.HOLY_AVENGER_TALENT.id} /> where beacon healing was included twice.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-09-11'),
    changes: 'Shuffled the checklist to put higher importance things higher in the list.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-08-03'),
    changes: <><SpellLink id={SPELLS.DEVOTION_AURA_TALENT.id} /> analysis will no longer crash when the combatlog is corrupt.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-24'),
    changes: <>Improved the accuracy of the <SpellLink id={SPELLS.DEVOTION_AURA_TALENT.id} /> statistic by correctly scaling the passive via the new formula (<a href="https://github.com/MartijnHols/HolyPaladin/blob/master/Spells/Talents/60/DevotionAura.md#about-the-passive-effect">more info</a>).</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-24'),
    changes: <>Improved the accuracy of the <SpellLink id={SPELLS.DEVOTION_AURA_TALENT.id} /> statistic by excluding false positives such as <SpellLink id={SPELLS.STAGGER.id} /> from the <SpellLink id={SPELLS.AURA_MASTERY.id} /> effect. Added a link to WCL to view the details of Aura Mastery.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-22'),
    changes: 'Changed the "FoL/HL on beacons" statistic to "Direct beacon healing", so it now includes all beacon transfering spells.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-22'),
    changes: <>Reworked the <SpellLink id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} /> analyzer to get a much more accurate result. The old method had a lot of false positive damage included due to bugs in the logs coming out of the game.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-22'),
    changes: <>Changed the <SpellLink id={SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id} /> analyzer to include back to back procs.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-21'),
    changes: <>Healing increases such as Ilterendi, Crown Jewel of Silvermoon now correctly include boosted healing caused by <SpellLink id={SPELLS.AVENGING_CRUSADER_TALENT.id} />.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-19'),
    changes: <>Added <SpellLink id={SPELLS.AVENGING_CRUSADER_TALENT.id} /> to the cooldown tracker.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-19'),
    changes: 'Removed Tyr\'s Deliverance.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-18'),
    changes: <>Added an accurate <SpellLink id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} /> stat for the reworked version.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-03'),
    changes: <>Fixed a bug where the mana reduction by <SpellLink id={SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id} /> of <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> and <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} /> was not correctly accounted for in the cooldowns tab.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-29'),
    changes: <>Updated the crit bonus for <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> to 30% (up from 25%).</>,
    contributors: [Zerotorescue],
  },
];
