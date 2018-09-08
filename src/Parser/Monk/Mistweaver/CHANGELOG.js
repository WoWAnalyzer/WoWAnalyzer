import React from 'react';

import { Anomoly } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

export default [
  {
    date: new Date('2018-09-07'),
    changes: 'Updated Player Log Data tab to include fixes and additional data needed to support the BfA Mistweaver Monk spreadsheet.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2018-09-05'),
    changes: <React.Fragment>Fixed mana cost of all spells. Updated suggestion for <SpellLink id={SPELLS.LIFECYCLES_TALENT.id} /> usage and removed <SpellLink id={SPELLS.SOOTHING_MIST.id} /> suggestion from the analyzer.</React.Fragment>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2018-07-22'),
    changes: <React.Fragment>Fix crash when <ItemLink id={ITEMS.DRAPE_OF_SHAME.id} /> is used.</React.Fragment>,
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
