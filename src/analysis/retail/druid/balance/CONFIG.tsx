import { Hartra344, Sref } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Sref, Hartra344],
  expansion: Expansion.Dragonflight,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '10.0.2',
  isPartial: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hello Moonkins! This tool is intended to show major statistics and potential issues in your
      rotation. The Balance Druid analyzer is mostly updated for Dragonflight but the most important
      information is present - like DoT uptime.
      <br />
      <br />
      If you have any idea on what is missing, we would be happy if you let us know directly. For
      fastest response you can PM me (Sref) on Discord.
      <br />
      <br />
      If you want to learn more about how to play Moonkin, visit{' '}
      <a
        href="https://discordapp.com/invite/0dWu0WkuetF87H9H"
        target="_blank"
        rel="noopener noreferrer"
      >
        DreamGrove, the Druid's Discord
      </a>{' '}
      or{' '}
      <a
        href="https://www.dreamgrove.gg/balance/compendium/"
        target="_blank"
        rel="noopener noreferrer"
      >
        DreamGrove.gg | 10.0.0 Compendium
      </a>
      .
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  // TODO update to DF log
  exampleReport: '/report/H1C8GXPWxMqtvaVz/23-5+Terros/Mokaba',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.BALANCE_DRUID,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "BalanceDruid" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
