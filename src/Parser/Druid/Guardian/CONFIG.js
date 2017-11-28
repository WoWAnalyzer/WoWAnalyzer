import React from 'react';

import { faide } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.GUARDIAN_DRUID,
  maintainers: [faide],
  description: (
    <div>
      Hi! I'm faide, and I maintain the guardian druid analyzer.  Thanks for being here!<br /><br />

      The suggestions and statistics here are provided to give you an idea of how to improve your play, both defensively and offensively.  A great player can manage both aspects of the role, and both are important to being an effective tank.<br /><br />

      The guardian toolkit is big and diverse, and knowing every corner of it is the key to success.  The most important thing is to keep your hard-hitting, rage generating spells on cooldown at all times (<SpellLink id={SPELLS.THRASH_BEAR.id} />, <SpellLink id={SPELLS.MANGLE_BEAR.id} />, <SpellLink id={SPELLS.MOONFIRE.id} /> with <SpellLink id={SPELLS.GALACTIC_GUARDIAN_TALENT.id} />). Keep <SpellLink id={SPELLS.IRONFUR.id} /> up when you're tanking the boss, use <SpellLink id={SPELLS.FRENZIED_REGENERATION.id} /> when you're low or taking heavy damage, use <SpellLink id={SPELLS.BARKSKIN.id} /> and <SpellLink id={SPELLS.RAGE_OF_THE_SLEEPER.id} /> frequently to mitigate and deal loads of damage, and save <SpellLink id={SPELLS.SURVIVAL_INSTINCTS.id} /> for big hits.<br /><br />

      If you have any suggestions or feedback on the analyzer, check out the Github issue below. If you'd like to know more about Guardian Druid, head over to the <a href="https://discord.gg/dreamgrove" target="_blank" rel="noopener noreferrer">Dreamgrove</a> discord server.  We have tons of resources and guides to get you started.
    </div>
  ),
  completeness: SPEC_ANALYSIS_COMPLETENESS.GREAT, // When changing this please make a PR with ONLY this value changed, we will do a review of your analysis to find out of it is complete enough.
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/issues/413',

  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
