import React from 'react';

import { blazyb, sref } from 'MAINTAINERS';

import SPECS from 'common/SPECS';

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
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/issues/55',
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
