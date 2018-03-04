import React from 'react';

import { Chizu } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.AFFLICTION_WARLOCK,
  maintainers: [Chizu],
  description: (
    <div>
      Hello fellow Netherlords! With some help from a theorycrafter from Warlock Discord, we've put together this tool to help you improve your gameplay. It should be fine for you generally, but it will be even more useful in an expert's hands. <br /> <br />

      As for a general rule of thumb - don't overcap your shards, try to get them wherever you can, snipe shards from adds when they're present. Always try to buff your
      <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} icon/>s as much as possible, with <SpellLink id={SPELLS.DRAIN_SOUL.id} icon/>, <SpellLink id={SPELLS.REAP_SOULS.id} icon/> or
      <SpellLink id={SPELLS.HAUNT_TALENT.id} icon/>. Don't let your dots fall off and try to move as least as you can (but don't ignore encounter mechanics... too much, hehe). <br /> <br />

      If you have any questions about Warlocks, feel free to pay a visit to <a href="https://goo.gl/7PH6Bn" target="_blank" rel="noopener noreferrer">Council of the Black Harvest Discord</a>
      or <a href="http://lockonestopshop.com" target="_blank" rel="noopener noreferrer">Lock One Stop Shop</a>, if you'd like to discuss anything about this analyzer, message me @Chizu on WoWAnalyzer Discord.
    </div>
  ),
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
