import React from 'react';

import { blazyb, sref } from 'MAINTAINERS';

import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.RESTORATION_DRUID,
  maintainers: [blazyb, sref],
  description: (
    <div>
      Welcome to the Resto Druid analyzer! We hope you find these suggestions and statistics useful.
      <br /><br />

      If you want to learn more about Resto Druids, join the Druid community at the <a href="https://discord.gg/dreamgrove" target="_blank" rel="noopener noreferrer">Dreamgrove discord channel</a>. Remember to check the pins (ctrl-P while in #resto channel) for guides, FAQs, and gearing guidelines.
    </div>
  ),
  completeness: SPEC_ANALYSIS_COMPLETENESS.GREAT, // When changing this please make a PR with ONLY this value changed, we will do a review of your analysis to find out of it is complete enough.
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/issues/55',
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
