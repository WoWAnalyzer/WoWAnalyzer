import React from 'react';

import { Zerotorescue } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-08-03'),
    changes: <React.Fragment><SpellLink id={SPELLS.DEVOTION_AURA_TALENT.id} /> analysis will no longer crash when the combatlog is corrupt.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-24'),
    changes: <React.Fragment>Improved the accuracy of the <SpellLink id={SPELLS.DEVOTION_AURA_TALENT.id} /> statistic by correctly scaling the passive via the new formula (<a href="https://github.com/MartijnHols/HolyPaladin/blob/master/Spells/Talents/60/DevotionAura.md#about-the-passive-effect">more info</a>).</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-24'),
    changes: <React.Fragment>Improved the accuracy of the <SpellLink id={SPELLS.DEVOTION_AURA_TALENT.id} /> statistic by excluding false positives such as <SpellLink id={SPELLS.STAGGER.id} /> from the <SpellLink id={SPELLS.AURA_MASTERY.id} /> effect. Added a link to WCL to view the details of Aura Mastery.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-22'),
    changes: 'Changed the "FoL/HL on beacons" statistic to "Direct beacon healing", so it now includes all beacon transfering spells.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-22'),
    changes: <React.Fragment>Reworked the <SpellLink id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} /> analyzer to get a much more accurate result. The old method had a lot of false positive damage included due to bugs in the logs coming out of the game.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-22'),
    changes: <React.Fragment>Changed the <SpellLink id={SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id} /> analyzer to include back to back procs.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-21'),
    changes: <React.Fragment>Healing increases such as Ilterendi, Crown Jewel of Silvermoon now correctly include boosted healing caused by <SpellLink id={SPELLS.AVENGING_CRUSADER_TALENT.id} />.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-19'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.AVENGING_CRUSADER_TALENT.id} /> to the cooldown tracker.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-19'),
    changes: 'Removed Tyr\'s Deliverance.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-18'),
    changes: <React.Fragment>Added an accurate <SpellLink id={SPELLS.AURA_OF_SACRIFICE_TALENT.id} /> stat for the reworked version.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-03'),
    changes: <React.Fragment>Fixed a bug where the mana reduction by <SpellLink id={SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id} /> of <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> and <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} /> was not correctly accounted for in the cooldowns tab.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-29'),
    changes: <React.Fragment>Updated the crit bonus for <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> to 30% (up from 25%).</React.Fragment>,
    contributors: [Zerotorescue],
  },
];
