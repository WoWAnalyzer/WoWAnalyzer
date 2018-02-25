import React from 'react';

import { Iskalla, Gebuz } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.BALANCE_DRUID,
  maintainers: [Gebuz, Iskalla],
  description: (
    <div>
      Hello Moonkins! This tool is intended to show major statistics and potential issues in your rotation. Please mind that it can always be improved upon, so if you see anything that you disagree with or think is missing please let us know!<br/><br/>

      As a rule of thumb: Never overcap Astral Power, keep your moon spells on cooldown, don't overcap empowerments and keep your dots up on the target(s) at all times. Remember to pool Astral Power prior to movement.<br/><br/>

      If you want to learn more about how to play Moonkin, visit <a href="https://goo.gl/xNHVnK" target="_blank" rel="noopener noreferrer">DreamGrove, the Druid's Discord</a>. Don't forget to check the <kbd>#resources</kbd> channel while you are there!
    </div>
  ),
  completeness: SPEC_ANALYSIS_COMPLETENESS.GREAT, // good = it matches most common manual reviews in class discords, great = it support all important class features
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/issues/421',
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};