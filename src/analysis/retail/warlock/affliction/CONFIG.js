import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [],
  expansion: Expansion.Shadowlands,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '9.0.1',
  isPartial: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  // TODO: once there is an estabilished "rule of thumb" rotation, put it in the description
  description: (
    <>
      Hello fellow Netherlords! With some help from <strong>Motoko</strong> from Warlock Discord,
      we've put together this tool to help you improve your gameplay. It should be fine for you
      generally, but it will be even more useful in an expert's hands. <br /> <br />
      If you have any questions about Warlocks, feel free to pay a visit to{' '}
      <a href="https://discord.gg/BlackHarvest" target="_blank" rel="noopener noreferrer">
        Council of the Black Harvest Discord
      </a>
      &nbsp; or{' '}
      <a href="http://lockonestopshop.com" target="_blank" rel="noopener noreferrer">
        Lock One Stop Shop
      </a>
      , if you'd like to discuss anything about this analyzer, message me @Chizu#2873 on WoWAnalyzer
      Discord.
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/TGzmk4bXDZJndpj7/6-Heroic+Opulence+-+Kill+(8:12)/14-Optikz',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.AFFLICTION_WARLOCK,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "AfflictionWarlock" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
