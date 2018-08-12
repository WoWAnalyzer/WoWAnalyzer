import React from 'react';

import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { Blazballs, JLassie82, Putro } from 'CONTRIBUTORS';

export default [
  {
    date: new Date('2018-08-12'),
    changes: 'Removed all legendaries and tier gear in preparation for Battle for Azeroth launch',
    contributors: [Putro],
  },
  {
    date: new Date('2018-08-06'),
    changes: <React.Fragment>Created a <SpellLink id={SPELLS.CAREFUL_AIM_TALENT.id} /> module, adds buff indicators to relevant spells in the timeline, adjusted placement of statistic boxes and added example logs to everything BFA related.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-07-23'),
    changes: 'Updated a large amount of modules to be ready for pre-patch and BFA. Updated patch combatility to 8.0.1.',
    contributors: [Putro],
  },
  {
    date: new Date('2018-04-10'),
    changes: <React.Fragment>Fixes A Murder of Crows to properly calculate the boss health.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-03-22'),
    changes: <React.Fragment>Fixed Sentinel module after Blizzard fixed the bugs with the spell. </React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-03-01'),
    changes: <React.Fragment>Added a Marking Targets and Hunter's Mark module. Also updated handling for Zevrim's Hunger.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-27'),
    changes: <React.Fragment>Updated the <SpellLink id={SPELLS.LOCK_AND_LOAD_TALENT.id} /> module to include some probability calculations on your chance of getting that amount or lower procs.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-19'),
    changes: 'Spring cleaning in many modules. Added icons to Vulnerable Applications and Focus Usage modules, added a breakdown of which casts were cancelled',
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-05'),
    changes: <React.Fragment>Added additional information to the Call of the Wild module, to show cooldown reduction on the various affected spells. </React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-30'),
    changes: 'Added a tooltip on the focus usage chart that shows focus used aswell as amount of casts of the the given ability',
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-05'),
    changes: <React.Fragment>Added support for Sentinel, and included the current bugged ticks of Sentinel.</React.Fragment>,
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
    changes: <React.Fragment>Added support for Celerity of the Windrunners, Magnetized Blasting Cap Launcher, Zevrim's Hunger, <ItemLink id={ITEMS.ROOTS_OF_SHALADRASSIL.id} />, Call of the Wild, The Apex Predators Claw and The Shadow Hunters Voodoo Mask.</React.Fragment>,
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
    changes: <React.Fragment>Updated Trick Shot to properly account for both single-target and cleave damage, added support for tier 21, and fixed a bug in the <SpellLink id={SPELLS.TRUESHOT.id} /> module where it counted too many <SpellLink id={SPELLS.AIMED_SHOT.id} /> than it should.</React.Fragment>,
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
    changes: <React.Fragment>Added a suggestion for execute trueshots and a A Murder of Crows suggestion when boss has between 25 and 20% hp, so the player can better utilise Bullseye artifact trait.</React.Fragment>,
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
    changes: <React.Fragment>Minor update to the <SpellLink id={SPELLS.LOCK_AND_LOAD_TALENT.id} /> module and its calculation of expected procs.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-25'),
    changes: <React.Fragment> Added 5 new talent modules (<SpellLink id={SPELLS.EXPLOSIVE_SHOT_TALENT.id} />, <SpellLink id={SPELLS.PIERCING_SHOT_TALENT.id} />, Volley, A Murder of Crows, Trick Shot), fixed <SpellLink id={SPELLS.TRUESHOT.id} /> CD, added Focus Dump Checker.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-25'),
    changes: <React.Fragment>Updated True Aim to include damage contributed information.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-25'),
    changes: <React.Fragment> Adjust Tier 20 2p to account for nerfs.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-22'),
    changes: <React.Fragment>Updated suggestions overall, added avatar, removed Cyclonic Burst impact from cooldown tracker, added suggestion to TimeFocusCapped, updated AlwaysBeCasting and CastEfficiency.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-22'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.TRUESHOT.id} /> statistic with average <SpellLink id={SPELLS.AIMED_SHOT.id} /> per <SpellLink id={SPELLS.TRUESHOT.id} />, and average starting focus per <SpellLink id={SPELLS.TRUESHOT.id} />.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-22'),
    changes: <React.Fragment>Added Tier 20 2p dmg increase breakdown.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-22'),
    changes: <React.Fragment>Added Soul of the Huntmaster, MKII Gyroscopic Stabilizer and War Belt of the Sentinel Army support.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-20'),
    changes: <React.Fragment>Added <ItemLink id={ITEMS.TARNISHED_SENTINEL_MEDALLION.id} /> and <SpellLink id={SPELLS.TRUESHOT.id} /> pairing tooltip.</React.Fragment>,
    contributors: [Blazballs],
  },
  {
    date: new Date('2017-10-20'),
    changes: <React.Fragment> Added True Aim and <SpellLink id={SPELLS.LOCK_AND_LOAD_TALENT.id} /> support.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-16'),
    changes: <React.Fragment> Added Ullr's Feathered Snowshoes to account for the <SpellLink id={SPELLS.TRUESHOT.id} /> CDR it provides.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-16'),
    changes: <React.Fragment> Added Tier 19 2p support.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-14'),
    changes: <React.Fragment>Added Patient Sniper tracking.</React.Fragment>,
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
    changes: <React.Fragment> remove Cyclonic burst from Cooldown view.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-05'),
    changes: <React.Fragment> Added Quick Shot reduction for <SpellLink id={SPELLS.TRUESHOT.id} />.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-04'),
    changes: <React.Fragment> Added <SpellLink id={SPELLS.AIMED_SHOT.id} /> and Vulnerable tracker.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-03'),
    changes: <React.Fragment>Added Tier 20 2p and Tier 20 4p support.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('02-10-2017'),
    changes: <React.Fragment> Added Bullseye buff to hunter_spells for future usage.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-02'),
    changes: 'Changed dead time to stricter, and get the player to cast more (should generally always be casting something).',
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-02'),
    changes: <React.Fragment>Added suggestions to Windburst and A Murder of Crows under CastEfficiency.</React.Fragment>,
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
    changes: <React.Fragment>Fixed Cooldown to not include Windburst buff.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-09-05'),
    changes: 'Base files added.',
    contributors: [JLassie82],
  },
];
