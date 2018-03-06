import React from 'react';

import { Anomoly } from 'MAINTAINERS';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.MISTWEAVER_MONK,
  maintainers: [Anomoly],
  patchCompatibility: '7.3.5',
  description: (
    <div>
      Hello all! Thanks so much for taking the time use this tool as a way to improve your play. The goal is to provide targeted suggestions to improve your overall Mistweaver Monk play. The suggestions are based on the current theorycrafting and practical knowledge from some of the best Mistweavers playing this game. (And even some former mistweavers who still like to help us dreamers out.) <br /> <br />

      The tool is not perfect so I am always looking to improve it. If you have any suggestions or comments, don't hesitated to swing by the GitHub Issue linked below, or the <a href="https://discord.gg/0dkfBMAxzTkWj21F" target="_blank" rel="noopener noreferrer">Peak of Serenity</a> discord server. You can also contact me directly on either BattleNet (Anomoly#1464) or Discord (Anomoly#6931). Thanks and I hope you continue to enjoy the tool!
    </div>
  ),
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
