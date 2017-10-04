import React from 'react';

import SPECS from 'common/SPECS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.MARKSMANSHIP_HUNTER,
  maintainer: '@JLassie82',

  description: (
    <div>
      Hey, we are working on making this analyzer as good as we can. We hope that the suggestions that will be implemented in the future, will be helpful in improving your overall performance.<br /><br />

      You might notice that currently there aren't a lot of suggestions, or a lot of stuff generally implemented. This is the reason the spec is still listed as "Needs more work", but we hope to be able to remedy this in the nearest future.<br /><br />

      The modules we plan on implementing will include a focus tracker, a patient sniper tracker, a t202p tracker and more. There is a link below to the issue on GitHub for more information.<br /><br />

      As a general rule of thumb, you want to never be capping on focus, you always want to be casting something, and you want to utilize t202p by casting aimed shots in pairs. This results in a rotation where you cast <SpellLink id={SPELLS.MARKED_SHOT.id} /> followed by <SpellLink id={SPELLS.ARCANE_SHOT.id} /> into 2x <SpellLink id={SPELLS.AIMED_SHOT.id} /> - these windows can be started at around 65 focus. You want to use <SpellLink id={SPELLS.WINDBURST.id}/> as often as possible, without interrupting your current <SpellLink id={SPELLS.VULNERABLE.id} /> window, and these can be started at almost any focus level. You want to be casting <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} /> as often as possible, however generally never during <SpellLink id={SPELLS.TRUESHOT.id} />. You should always be starting a <SpellLink id={SPELLS.TRUESHOT.id} /> window with high focus, and after a <SpellLink id={SPELLS.MARKED_SHOT.id} /> or <SpellLink id={SPELLS.WINDBURST.id} /> to gain the most out of the only cooldown we have. For more in-depth rotational stuff, please check the guide linked beneath.<br /><br />

      If you want to learn more about Marksmanship Hunters, join the Hunter community on the Trueshot Lodge discord: <a href="https://discordapp.com/invite/trueshot" target="_blank" rel="noopener noreferrer">https://discordapp.com/invite/trueshot</a>. The <kbd>#Marksmanship</kbd> channel has a lot of helpful people, and if you post your logs in <kbd>#log-reviews</kbd>, you can expect to get some good pointers for improvement from the community. The best guide available currently is the guide on <a href="https://www.icy-veins.com/wow/marksmanship-hunter-pve-dps-guide">Icy-veins</a>. It is maintained by Azortharion, one of the best hunters in the world, and it is constantly fact-checked by community-members, and improved upon on an almost weekly basis.
    </div>
  ),
  // When changing this please make a PR with ONLY this value changed, we will do a review of your analysis to find out of it is complete enough.
  completeness: SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK,
  //Link to GitHub issue
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/issues/418',

  // Don't change these:
  changelog: CHANGELOG,
  parser: CombatLogParser,
  // used for generating a GitHub link directly to your spec:
  path: __dirname,
};
