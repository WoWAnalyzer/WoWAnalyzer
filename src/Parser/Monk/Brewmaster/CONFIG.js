import React from 'react';
import { emallson } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.BREWMASTER_MONK,
  maintainers: [emallson],
  description: (
    <div>
      This spec is maintained by <a href="//raider.io/characters/us/arthas/Eisenpelz"><code>emallson</code></a>. If you have implementation or theorycrafting questions, hit me up in the <code>#brewcraft</code> channel of the <a href="http://discord.gg/peakofserenity">Peak of Serenity</a> Discord server. For general help in evaluating your logs, use the <code>#brew_questions</code> channel.
    </div>
  ),
  completeness: SPEC_ANALYSIS_COMPLETENESS.GOOD, // good = it matches most common manual reviews in class discords, great = it support all important class features
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
