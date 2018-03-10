import React from 'react';

import { Zerotorescue } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.HOLY_PALADIN,
  maintainers: [Zerotorescue],
  patchCompatibility: '7.3.5',
  description: (
    <div>
      Hey I've been hard at work making this analyzer for you. I hope the suggestions give you useful pointers to improve your performance. Remember: focus on improving only one or two important things at a time. Improving isn't easy and will need your full focus until it becomes second nature to you.<br /><br />

      You might have noticed the suggestions focus mostly on improving your cast efficiencies. This might seem silly, but it's actually one of the most important things for us Holy Paladins. Avoid having your <SpellLink id={SPELLS.AVENGING_WRATH.id} icon /> and other cooldowns available unused for long periods of time (they're not just raid cooldowns, they're required for you to have decent throughput and not run OOM) and <b>hit those buttons</b> that have short cooldowns (such as <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} icon /> and <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} icon />). Ohh and don't cast Light of the Martyr unless there's nothing else to cast.<br /><br />

      If you want to learn more about Holy Paladins, join the Paladin community at the <a href="https://discordapp.com/invite/hammerofwrath" target="_blank" rel="noopener noreferrer">Hammer of Wrath discord</a>. The <kbd>#holy-faq</kbd> channel has a lot of useful information including links to good guides.
    </div>
  ),
  exampleReport: '/report/hNqbFwd7Mx3G1KnZ/18-Mythic+Antoran+High+Command+-+Kill+(6:51)/Taffly',

  // Shouldn't have to change these:
  changelog: CHANGELOG,
  parser: CombatLogParser,
  // used for generating a GitHub link directly to your spec
  path: __dirname,
};
