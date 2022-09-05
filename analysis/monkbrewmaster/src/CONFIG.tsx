import { emallson } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [emallson],
  expansion: Expansion.Shadowlands,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '9.2.7',
  isPartial: false,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hello, and welcome to the Brewmaster Analyzer! This analyzer is maintained by{' '}
      <a href="//raider.io/characters/us/turalyon/Eisenpelz">
        <code>emallson</code>
      </a>
      , a Brewmaster theorycrafter and main.
      <br />
      <br />
      If you are new to the spec, focus first on hitting the targets in the Checklist and
      Suggestions tabs. The statistics below provide further insight both into your performance and
      into the effectiveness of your gear and stats.
      <br />
      <br />
      If you have questions about the output, please ask in the <code>#brew-questions</code> channel
      of the <a href="http://discord.gg/peakofserenity">Peak of Serenity</a>. If you have
      theorycrafting questions or want to contribute, come say hi in <code>#craft-brewing</code>.
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/bdf9wjm7XJQn3DCR/31-Mythic+The+Council+of+Blood+-+Wipe+15+(4:38)/Xaronbm',
  // These are multipliers to the stats applied *on pull* that are not
  // included in the stats reported by WCL. These are *baked in* and do
  // not multiply temporary buffs.
  //
  // In general, it looks like armor is the only one that isn't applied
  // by WCL.
  statMultipliers: { armor: 1.25 },

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.BREWMASTER_MONK,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "BrewmasterMonk" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
