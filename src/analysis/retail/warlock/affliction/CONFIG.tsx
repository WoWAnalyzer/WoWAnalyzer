import { Jonfanz } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';
import type Config from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const CONFIG: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Jonfanz],
  expansion: Expansion.Dragonflight,
  // The WoW client patch this spec was last updated.
  patchCompatibility: null,
  isPartial: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hello fellow Netherlords! Thank you for taking the time to use this tool as a way to improve
      your play. While the goal of this tool is to improve your overall Affliction Warlock play, the
      tool is currently under active development and may provide suggestions that are incorrect or
      strange.
      <br /> <br />
      The tool is not perfect so I am always looking to improve it. If you have any suggestions or
      comments, don't hesitated to swing by the GitHub Issue linked below, or the{' '}
      <a href="https://discord.gg/BlackHarvest" target="_blank" rel="noopener noreferrer">
        Council of the Black Harvest Discord
      </a>{' '}
      or{' '}
      <a href="https://www.kalamazi.gg/guides/affliction" target="_blank" rel="noopener noreferrer">
        Kalamazi&apos;s Affliction Guide
      </a>{' '}
      or{' '}
      <a
        href="https://www.method.gg/guides/affliction-warlock"
        target="_blank"
        rel="noopener noreferrer"
      >
        Method&apos;s Affliction Guide
      </a>
      Thanks and I hope you continue to enjoy the tool!
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/JGFabW3gfqrtynX1/5-Normal+Eranog+-+Kill+(5:08)/Crunky',

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
  path: import.meta.url,
};
export default CONFIG;
