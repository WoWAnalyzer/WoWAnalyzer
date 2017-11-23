import React from 'react';

import { Juko8 } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.WINDWALKER_MONK,
  maintainers: [Juko8],
  description: (
  <div>
    Hello! The Windwalker module is currently under major construction. We are working to slowly add functionality in to provide a comprehesive analysis of your playstyle.<br /> <br/>
  
    While the spec is built out, please head over to the <a href="https://discord.gg/0dkfBMAxzTkWj21F" target="_blank" rel="noopener noreferrer">Peak of Serenity</a> discord server for any questions or feeback. You can reach me there as Juko8. Thank you and thanks for understanding as we build at this spec.
  </div>
  ),
  completeness: SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK, // When changing this please make a PR with ONLY this value changed, we will do a review of your analysis to find out of it is complete enough.
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
