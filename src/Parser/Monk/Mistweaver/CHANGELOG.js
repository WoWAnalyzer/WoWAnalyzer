import React from 'react';

import { Anomoly, Zerotorescue } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-01-18'),
    changes: <Wrapper>Updated Essence Font HoT usage thresholds to lower values based on current healing methods. Also, fixed a rare 'NaN' error.</Wrapper>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-12-29'),
    changes: 'Fixed display in the timeline and the inclusion in active time of channeled abilities.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-12-24'),
    changes: 'Added Mistweaver checklist items',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-12-13'),
    changes: 'Added in Mistweaver Mastery calculation to stats',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-11-28'),
    changes: <Wrapper>Fixed bug with <SpellLink id={SPELLS.THUNDER_FOCUS_TEA.id} /> -> <SpellLink id={SPELLS.RENEWING_MIST.id} /> cast efficiency. Updated Player Log Data tab for additional items for T21 Speadsheet version</Wrapper>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-11-06'),
    changes: <Wrapper>Updated Always Be Casting calculation to take into consideration <SpellLink id={SPELLS.ESSENCE_FONT.id} /> not having a begincast event</Wrapper>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-10-24'),
    changes: <Wrapper>Updated <SpellLink id={SPELLS.THUNDER_FOCUS_TEA.id} />, <SpellLink id={SPELLS.DANCING_MISTS.id} />, and <SpellLink id={SPELLS.UPLIFTING_TRANCE_BUFF.id} /> statistics formatting</Wrapper>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-10-17'),
    changes: 'Added T21 2 and 4 set healing contribution statistics',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-09-30'),
    changes: 'Added Zen Pulse and Chi Wave to the Cast Efficiency tab. Updated the Maintainer information',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-09-27'),
    changes: 'Clean up some old code and update the Second Gust of Mist Overhealing calculation to show overhealing of the Second Gust proc as a % of the total healing of that second Gust',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-09-20'),
    changes: 'Update Essence Font Mastery tooltip to include overhealing of second Gust of Mist proc',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-09-04'),
    changes: 'Refactored dependancies to follow new format. No change visible to user',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-08-31'),
    changes: 'Initial Extended Healing Trait implementation. Currently estimating the trait as a 5% increase per rank.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-08-30'),
    changes: 'Initial Relic Traits added to statics view.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-08-25'),
    changes: 'Corrected issue with MonkSpreadsheet tab. Removed / Trimmed some suggestions as this data was redundant when combined with WCL',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-08-16'),
    changes: 'Soothing Mist suggestion added',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-08-16'),
    changes: 'Added the effective healing contribute of Enveloping Mists as a statistic',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-08-15'),
    changes: 'Updates to Mistweaver module to align with new module structure. No information should be lost, but this will be moved around',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-08-09'),
    changes: 'Bug Fix for Dancing Mist calculation and Ending Mana.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-08-05'),
    changes: 'Added Player Log tab to support new Mistweaver spreadsheet needs.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-08-01'),
    changes: 'Bug Fix for Thunder Focus Tea casts calulating incorrectly when specific cast sequence was used',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-07-30'),
    changes: 'Added Refreshing Jade Wind suggestion and updated some talent descriptions',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-07-08'),
    changes: 'Added Ovyd\'s Winter Wrap healing contribution.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-07-03'),
    changes: 'Added Petrichor Lagniappe wasted reduction time in seconds',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-06-26'),
    changes: 'Added Shelter of Rin and Doorway To Nowhere, fixed Ei\'thas, Lunar Glides of Eramas healing contribution formula.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-06-20'),
    changes: 'Added T20 2pc Tracking, Added support for Focused Thunder, adjusted suggestion for TFT usage.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-06-18'),
    changes: 'Implement Dead Time / Non-Healing Time.  Update Mana Tea data tip to show MP5',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-06-16'),
    changes: 'Tier 20 4 Piece Effective Healing contribution implemented.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-06-15'),
    changes: 'Mana Cost adjustments for Patch 7.2.5',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-06-09'),
    changes: 'Added Ei\'thas, Lunar Glides of Eramas statistic and adjusted Sheilun\'s Gift issue warning to account for low stacks and high overheal.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-06-09'),
    changes: 'Celestial Breath and Mists of Sheilun buffs / procs and the healing associated. Refreshing Jade Wind Healing Implemented. Corrected some negative calculations with Uplifting Trance. Correcting formatting error with SG Stacks.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-06-05'),
    changes: 'Added utlity CDs to cast efficiency for tracking purposes.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-06-04'),
    changes: 'Added Chi Burst healing tracking and suggestions.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-06-02'),
    changes: 'Enabled Dancing Mists tracking.  Healing provided by Dancing Mists procs now show in analysis.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-06-01'),
    changes: 'Include healing from Chi-Ji talent into overall healing totals for monk.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-06-01'),
    changes: 'Essence Font Tracking Implemented including tagets hit and HOT buffs utilized.  Readme updates for all modules and cast efficiency targets.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-05-30'),
    changes: 'Adjusted some of the Dancing Mists logic per review. Added in missed Whispers of Shaohao healing. Tracking',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-05-29'),
    changes: 'Added Sheilun\'s Gift statistic and an overhealing suggestion. With Effusive Mists talent, Effuse casts at 12 stacks are considered wasted. Added simple proc counter for Dancing Mists.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-05-27'),
    changes: 'Added Thunder Focus Tea spell buff tracking. Added Lifecycles mana saving tracking, added Spirit of the Crane mana return tracking.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-05-26'),
    changes: <Wrapper>Added the remaining MW spells / abilities known as of now. Removed UT Usage issue, as this is going away in 7.2.5. Updated CPM Module to give a better understanding of MW Monk Spells. Incorporated TFT -> Viv usage in UT Proc calculations. All of this was done by <b>@anomoly</b>.</Wrapper>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-05-24'),
    changes: <Wrapper>Added <span className="Monk">Mistweaver Monk</span> support by <b>@Anomoly</b>! Thanks a lot for your contribution!</Wrapper>,
    contributors: [Anomoly],
  },
];
