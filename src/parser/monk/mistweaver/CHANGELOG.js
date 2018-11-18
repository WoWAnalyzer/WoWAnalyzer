import React from 'react';

import { Anomoly, Gao } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

export default [
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
    changes: <>Fix crash when <ItemLink id={ITEMS.DRAPE_OF_SHAME.id} /> is used.</>,
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
