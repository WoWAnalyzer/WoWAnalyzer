import React from 'react';

import { Iskalla, Gebuz } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.BALANCE_DRUID,
  maintainers: [Iskalla, Gebuz],
  description: (
    <div>
      Hello Moonkins! This tool is intended to show major statistics and potential issues in your rotation. Please, mind that this is still work in progress and will continue to grow and change!<br/>
      There are a few known issues that will be fixed as soon as possible! You can read all about them in the GitHub issue.<br/><br/>

      As a rule of thumb: Never overcap Astral Power, keep your moons rotating, don't overcap empowerments and keep your dots on the target(s) at all times. Remember to pool AsP prior to movement, and try to avoid dot spam while doing so.<br/><br/>

      If you want to learn more about Moonkin, visit <a href="https://goo.gl/xNHVnK" target="_blank" rel="noopener noreferrer">DreamGrove, the Druid's Discord</a>. Don't forget to check the <kbd>#resources</kbd> channel while you are there!
    </div>
  ),
  completeness: SPEC_ANALYSIS_COMPLETENESS.GREAT, // good = it matches most common manual reviews in class discords, great = it support all important class features
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/issues/421',
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};