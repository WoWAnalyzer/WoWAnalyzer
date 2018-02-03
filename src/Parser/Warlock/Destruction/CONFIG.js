import React from 'react';

import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

import { Chizu } from 'MAINTAINERS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.DESTRUCTION_WARLOCK,
  maintainers: [Chizu],
  completeness: SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK, // good = it matches most common manual reviews in class discords, great = it support all important class features
  changelog: CHANGELOG,
  description: (
    <div>
      Hello fellow Netherlords! While I gotta admit this tool feels more like a statistic than something that really helps you (just yet!), I hope it still is useful to you. Any suggestions as to what could be useful to see are welcome and I'll try to implement them in order for this tool to be more than just a glorified WCL log. <br /> <br />

      As for a general rule of thumb - keep your <SpellLink id={SPELLS.IMMOLATE_DEBUFF.id}/> up as much as you can, cast <SpellLink id={SPELLS.CONFLAGRATE.id}/> on CD, same with <SpellLink id={SPELLS.DIMENSIONAL_RIFT_CAST.id}/> (unless you have Lessons of Space-Time). Dump shards into fat <SpellLink id={SPELLS.CHAOS_BOLT.id}/> and just overall don't forget to cast spells when you have them (<SpellLink id={SPELLS.CHANNEL_DEMONFIRE_TALENT.id}/>, <SpellLink id={SPELLS.HAVOC.id}/> when there's something to cleave etc.). <br /> <br />

      If you have any questions about Warlocks, feel free to pay a visit to <a href="https://goo.gl/7PH6Bn" target="_blank" rel="noopener noreferrer">Council of the Black Harvest Discord</a>, if you'd like to discuss anything about this analyzer, leave a message on the GitHub issue or message me @Chizu on WoWAnalyzer Discord.
    </div>
  ),
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/issues/259',
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
