import React from 'react';

import Wrapper from 'common/Wrapper';

export default [
  {
    date: new Date('2017-10-24'),
    changes: 'Updated Thunder Focus Tea, Dancing Mist, and Uplifting Trance statistics formating',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-10-17'),
    changes: 'Added T21 2 and 4 set healing contribution statistics',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-09-30'),
    changes: 'Added Zen Pulse and Chi Wave to the Cast Efficiency tab. Updated the Maintainer information',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-09-27'),
    changes: 'Clean up some old code and update the Second Gust of Mist Overhealing calculation to show overhealing of the Second Gust proc as a % of the total healing of that second Gust',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-09-20'),
    changes: 'Update Essence Font Mastery tooltip to include overhealing of second Gust of Mist proc',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-09-04'),
    changes: 'Refactored dependancies to follow new format. No change visible to user',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-08-31'),
    changes: 'Initial Extended Healing Trait implementation. Currently estimating the trait as a 5% increase per rank.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-08-30'),
    changes: 'Initial Relic Traits added to statics view.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-08-25'),
    changes: 'Mistweaver Monk: Corrected issue with MonkSpreadsheet tab. Removed / Trimmed some suggestions as this data was redundant when combined with WCL',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-08-16'),
    changes: 'Mistweaver Monk: Soothing Mist suggestion added',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-08-16'),
    changes: 'Mistweaver Monk: Added the effective healing contribute of Enveloping Mists as a statistic',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-08-15'),
    changes: 'Mistweaver Monk: Updates to Mistweaver module to align with new module structure. No information should be lost, but this will be moved around',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-08-09'),
    changes: 'Mistweaver Monk: Bug Fix for Dancing Mist calculation and Ending Mana.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-08-05'),
    changes: 'Mistweaver Monk: Added Player Log tab to support new Mistweaver spreadsheet needs.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-08-01'),
    changes: 'Mistweaver Monk: Bug Fix for Thunder Focus Tea casts calulating incorrectly when specific cast sequence was used',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-07-30'),
    changes: 'Mistweaver Monk: Added Refreshing Jade Wind suggestion and updated some talent descriptions',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-07-08'),
    changes: 'Mistweaver Monk: Added Ovyd\'s Winter Wrap healing contribution.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-07-03'),
    changes: 'Mistweaver Monk: Added Petrichor Lagniappe wasted reduction time in seconds',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-06-26'),
    changes: 'Mistweaver Monk: Added Shelter of Rin and Doorway To Nowhere, fixed Ei\'thas, Lunar Glides of Eramas healing contribution formula.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-06-20'),
    changes: 'Mistweaver Monk: Added T20 2pc Tracking, Added support for Focused Thunder, adjusted suggestion for TFT usage.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-06-18'),
    changes: 'Mistweaver Monk: Implement Dead Time / Non-Healing Time.  Update Mana Tea data tip to show MP5',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-06-16'),
    changes: 'Mistweaver Monk: Tier 20 4 Piece Effective Healing contribution implemented.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-06-15'),
    changes: 'Mistweaver Monk: Mana Cost adjustments for Patch 7.2.5',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-06-09'),
    changes: 'Mistweaver Monk: Added Ei\'thas, Lunar Glides of Eramas statistic and adjusted Sheilun\'s Gift issue warning to account for low stacks and high overheal.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-06-09'),
    changes: 'Mistweaver Monk: Celestial Breath and Mists of Sheilun buffs / procs and the healing associated. Refreshing Jade Wind Healing Implemented. Corrected some negative calculations with Uplifting Trance. Correcting formatting error with SG Stacks.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-06-05'),
    changes: 'Mistweaver Monk: Added utlity CDs to cast efficiency for tracking purposes.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-06-04'),
    changes: 'Mistweaver Monk: Added Chi Burst healing tracking and suggestions.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-06-02'),
    changes: 'Mistweaver Monk: Enabled Dancing Mists tracking.  Healing provided by Dancing Mists procs now show in analysis.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-06-01'),
    changes: 'Mistweaver Monk: Include healing from Chi-Ji talent into overall healing totals for monk.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-06-01'),
    changes: 'Mistweaver Monk: Essence Font Tracking Implemented including tagets hit and HOT buffs utilized.  Readme updates for all modules and cast efficiency targets.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-05-30'),
    changes: 'Mistweaver Monk: Adjusted some of the Dancing Mists logic per review. Added in missed Whispers of Shaohao healing. Tracking',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-05-29'),
    changes: 'Mistweaver Monk: Added Sheilun\'s Gift statistic and an overhealing suggestion. With Effusive Mists talent, Effuse casts at 12 stacks are considered wasted. Added simple proc counter for Dancing Mists.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-05-27'),
    changes: 'Mistweaver Monk: Added Thunder Focus Tea spell buff tracking. Added Lifecycles mana saving tracking, added Spirit of the Crane mana return tracking.',
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-05-26'),
    changes: <Wrapper>Mistweaver Monk: Added the remaining MW spells / abilities known as of now. Removed UT Usage issue, as this is going away in 7.2.5. Updated CPM Module to give a better understanding of MW Monk Spells. Incorporated TFT -> Viv usage in UT Proc calculations. All of this was done by <b>@anomoly</b>.</Wrapper>,
    contributors: ['anomoly'],
  },
  {
    date: new Date('2017-05-24'),
    changes: <Wrapper>Added <span className="Monk">Mistweaver Monk</span> support by <b>@Anomoly</b>! Thanks a lot for your contribution!</Wrapper>,
    contributors: ['anomoly'],
  },
];
