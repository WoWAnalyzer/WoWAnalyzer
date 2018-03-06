import React from 'react';

import { Putro } from 'MAINTAINERS';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.SURVIVAL_HUNTER,
  maintainers: [Putro],
  patchCompatibility: '7.3.5',
  description: (
    <div>
      Hey, I've been hard at work to make this analyzer as good as I can. You'll notice a lot of things are still missing, and these will be included as time passes as I work on getting everything in this analyzer module up to scratch. <br />

      I hope that the suggestions and statistics will be helpful in improving your overall performance. Try and focus on improving only a few things at a time, until those become ingrained in your muscle memory so as to not be concentrating on many different things. <br /><br />

      If you want to learn more about Survival Hunters, join the Hunter community on the Trueshot Lodge discord: <a href="https://discordapp.com/invite/trueshot" target="_blank" rel="noopener noreferrer">https://discordapp.com/invite/trueshot</a>. The <kbd>#Survival</kbd> channel has a lot of helpful people, and if you post your logs in <kbd>#log-reviews</kbd>, you can expect to get some good pointers for improvement from the community. The <kbd>#Survival</kbd> channel is also a great place to post feedback for this analyzer, as I'll be very likely to see it there. <br /><br />The best guide available currently is the guide on <a href="https://www.icy-veins.com/wow/survival-hunter-pve-dps-guide">Icy-Veins</a>. It is maintained by Azortharion, one of the best hunters in the world, and it is constantly fact-checked by community-members, and improved upon on an almost weekly basis.
    </div>
  ),

  // Don't change these:
  changelog: CHANGELOG,
  parser: CombatLogParser,
  // used for generating a GitHub link directly to your spec:
  path: __dirname,
};
