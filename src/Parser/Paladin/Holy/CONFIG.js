import React from 'react';

import { Zerotorescue } from 'MAINTAINERS';

import SPECS from 'common/SPECS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.HOLY_PALADIN,
  maintainers: [Zerotorescue],
  description: (
    <div>
      Hey I've been hard at work making this analyzer for you. I hope the suggestions give you useful pointers to improve your performance. Remember: focus on improving only one or two important things at a time. Improving isn't easy and will need your full focus until it becomes second nature to you.<br /><br />

      You might have noticed the suggestions focus mostly on improving your cast efficiencies. This might seem silly, but it's actually one of the most important things for us Holy Paladins. Avoid having your <SpellLink id={SPELLS.AVENGING_WRATH.id} /> and other cooldowns available unused for long periods of time (they're not just raid cooldowns, they're required for you to do comparable throughput to other healers) and <b>hit those buttons</b> that have short cooldowns (<SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> and <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} />). Ohh and don't cast Light of the Martyr unless there's nothing else to cast.<br /><br />

      If you want to learn more about Holy Paladins, join the Paladin community at the Hammer of Wrath discord: <a href="https://discordapp.com/invite/hammerofwrath" target="_blank" rel="noopener noreferrer">https://discordapp.com/invite/hammerofwrath</a>. The <kbd>#holy-faq</kbd> channel has a lot of useful information including links to good guides.
    </div>
  ),
  // good = it matches most common manual reviews in class discords, great = it support all important class features
  completeness: SPEC_ANALYSIS_COMPLETENESS.GREAT,
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/milestone/2',

  // Shouldn't have to change these:
  changelog: CHANGELOG,
  parser: CombatLogParser,
  // used for generating a GitHub link directly to your spec
  path: __dirname,
};
