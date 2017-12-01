import React from 'react';

import { Hewhosmites } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.RETRIBUTION_PALADIN,
  maintainers: [Hewhosmites],
  description: (
  	<div>
  		I hope you get some use out this analyzer I have been working on. It is kind of hard to determine exactly what seperates the okay from the good and the good from the great (other than getting a Retribution proc on the great ones wings). <br/><br/>

  		Honestly my biggest take away for you is make sure to not waste any Holy Power and always be casting. <br/><br/>

  		If you want to learn more about Retribution Paladins make sure to also check out the Paladin discord: <a href="https://discordapp.com/invite/hammerofwrath" target="_blank" rel="noopener noreferrer">https://discordapp.com/invite/hammerofwrath</a>. The <kbd>#ret-faq</kbd> channel has some useful guides and the <kbd>#ret-discussion</kbd> has lots of memes if you're into that.<br/><br/>

  		Feel free to message me on discord or post in the spec discussion URL with any bugs or ideas for things I could work on!
  	</div>
  ),
  completeness: SPEC_ANALYSIS_COMPLETENESS.GOOD, // good = it matches most common manual reviews in class discords, great = it support all important class features
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/issues/323',
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
