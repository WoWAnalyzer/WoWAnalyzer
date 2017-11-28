import React from 'react';
import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.WINDWALKER_MONK,
  maintainer: '@Juko8',
  description: (
  <div>
      Hello! We have been working hard to make the Windwalker analyzer good, but there is still things left to improve.  We hope that the suggestions and statistics will be helpful in improving your overall performance. Try and focus on improving only a few things at a time, until those become ingrained in your muscle memory so as to not be concentrating on many different things. <br /> <br/>
  
    If you have any questions about the analyzer or Windwalker monks in general, join us in the <a href="https://discord.gg/0dkfBMAxzTkWj21F" target="_blank" rel="noopener noreferrer">Peak of Serenity</a> discord server and talk to us. You can reach me there as Juko8. Make sure to also check out our resources on Peakofserenity.com as well, it has pretty much everything you need to know. 
  </div>
  ),
  completeness: SPEC_ANALYSIS_COMPLETENESS.GOOD, // When changing this please make a PR with ONLY this value changed, we will do a review of your analysis to find out of it is complete enough.
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
