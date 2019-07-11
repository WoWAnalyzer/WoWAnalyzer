import React from 'react';

import { Anomoly, Gao, Zerotorescue, Abelito75 } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2019-07-2'),
    changes: <>Added <SpellLink id={SPELLS.WAY_OF_THE_CRANE.id} /> to the cooldowns tab.</>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2019-06-1'),
    changes: <>Added a check to make sure you using <SpellLink id={SPELLS.SOOTHING_MIST.id} /> efficiency while channeling it.</>,
    contributors: [Abelito75],
  },
  {
    date: new Date('2019-03-30'),
    changes: <>Added a check to make sure you cast <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} /> when there are enough targets around.</>,
    contributors: [Abelito75],
  },
  {
    date: new Date('2019-03-23'),
    changes: <>Updated <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> to check if you have innervate before counting mana.</>,
    contributors: [Abelito75],
  },
  {
    date: new Date('2019-03-21'),
    changes: <>Updated mastery tracking to more accurately reflect the spell that triggered the <SpellLink id={SPELLS.GUSTS_OF_MISTS.id} />. This includes updates to the statistic and healing efficiency sections.</>,
    contributors: [Abelito75],
  },
  {
    date: new Date('2019-03-15'),
    changes: <>Updated Mistweaver Spreadsheet tab to include  <SpellLink id={SPELLS.REFRESHING_JADE_WIND_TALENT.id} /> efficiency.</>,
    contributors: [Abelito75],
  },
  {
    date: new Date('2019-03-15'),
    changes: <>Added SI to buffs to buffs module to track  <SpellLink id={SPELLS.SECRET_INFUSION.id} />.</>,
    contributors: [Abelito75],
  },
  {
    date: new Date('2019-03-11'),
    changes: 'Added new Buffs module to track and highlight Mistweaver specific buffs on the timeline',
    contributors: [Anomoly],
  },
  {
    date: new Date('2019-03-11'),
    changes: 'Updated look and feel of Mistweaver Azerite traits to conform to new 3.0 style.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2019-03-10'),
    changes: <>Added overhealing check for <SpellLink id={SPELLS.MANA_TEA_TALENT.id} />.</>,
    contributors: [Abelito75],
  },
  {
    date: new Date('2019-02-25'),
    changes: <>Added statistics, suggestion, and checklist item for  <SpellLink id={SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.id} /> casting uptime.</>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2019-02-21'),
    changes: <>Added statistics for tracking the average stat gain from <SpellLink id={SPELLS.SECRET_INFUSION.id} />.</>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2019-02-7'),
    changes: <>Added statistics for tracking the number of <SpellLink id={SPELLS.RENEWING_MIST.id} /> during <SpellLink id={SPELLS.VIVIFY.id} /> casts. Also, did a quick bug fix for the Monk Spreadsheet import.</>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2019-02-7'),
    changes: <>Added statistics, suggestions, and checklist item for tracking the number of <SpellLink id={SPELLS.RENEWING_MIST.id} /> during <SpellLink id={SPELLS.MANA_TEA_TALENT.id} />. Also, adding some additional tooltips to the Healing Efficiency page.</>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2019-01-21'),
    changes: <>Ignore cooldown errors caused by <SpellLink id={SPELLS.FONT_OF_LIFE.id} /> (it is not detectable in logs so we can't make it 100% accurate).</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-01-21'),
    changes: <>Fixed a bug where <SpellLink id={SPELLS.SOOTHING_MIST.id} /> incorrectly triggered two GCDs, making downtime off.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-11-14'),
    changes: <>Added <SpellLink id={SPELLS.GUSTS_OF_MISTS.id}>Gusts of Mists</SpellLink> breakdown chart. Fixed bug with the ReM and Vivify mana efficiency.</>,
    contributors: [Gao],
  },
  {
    date: new Date('2018-11-2'),
    changes: <>Added the mana efficiency tab. Updated the Env:Viv cast ratio picture sizes.</>,
    contributors: [Gao],
  },
  {
    date: new Date('2018-10-30'),
    changes: <>Fixed an bug with <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> suggestion not displaying the correct mana saved amount.</>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2018-09-11'),
    changes: <>Added <SpellLink id={SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.id} /> to spreadsheet tab for use importing into Monk spreadsheet.</>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2018-09-11'),
    changes: <>Fixed <SpellLink id={SPELLS.SOOTHING_MIST.id} /> channeling time to be taken into account with Downtime statistic and suggestion.</>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2018-09-11'),
    changes: 'Added healing contribution statistic box for the Mistweaver Specific Azerite traits.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2018-09-08'),
    changes: 'Updated Checklist to leverage new format and included updates to the suggestions and thresholds. Cleaned up unused legendary files also.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2018-09-07'),
    changes: 'Updated Player Log Data tab to include fixes and additional data needed to support the BfA Mistweaver Monk spreadsheet.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2018-09-05'),
    changes: <>Fixed mana cost of all spells. Updated suggestion for <SpellLink id={SPELLS.LIFECYCLES_TALENT.id} /> usage and removed <SpellLink id={SPELLS.SOOTHING_MIST.id} /> suggestion from the analyzer.</>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2018-07-22'),
    changes: <>Fix crash when Drape of Shame is used.</>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2018-07-20'),
    changes: 'Pre-Patch Updates: Removed Effuse from the analyzer as the ability was removed in BfA. Updated Mana Costs of spells to use fixed cost versus a percentage of max mana.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2018-07-19'),
    changes: 'Pre-Patch Updates: Removed Uplifting Trance, Updated Renewing Mist Cooldown, Removed Essence Font from Thunder Focus Tea statistics, Removed Thunder Focus Tea suggestion for now as correct use is being defined',
    contributors: [Anomoly],
  },
  {
    date: new Date('2018-07-01'),
    changes: 'Trait and Artifact clean up along with GCD changes in Abilities for Battle for Azeroth',
    contributors: [Anomoly],
  },
  {
    date: new Date('2018-06-15'),
    changes: 'Updated Vivify to incorporate new healing interaction with Renewing Mist. Updated Renewing Mist change to now be a 2 charge spell.',
    contributors: [Anomoly],
  },
];
