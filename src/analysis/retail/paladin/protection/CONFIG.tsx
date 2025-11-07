import { emallson, Woliance } from 'CONTRIBUTORS';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';

// import CHANGELOG from './CHANGELOG';
import { SupportLevel } from 'parser/Config';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [emallson, Woliance],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '11.1.5',
  supportLevel: SupportLevel.Foundation,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hello, and welcome to the Protection Paladin Analyzer! This analyzer is maintained by{' '}
      <a href="//raider.io/characters/us/arthas/Akromah">
        <code>emallson</code>
      </a>
      , a Brewmaster main and Paladin fan, with assistance from the Protection theorycraft team.
      <br />
      <br />
      If you are new to the spec, focus first on hitting the targets in the Checklist and
      Suggestions tabs. The statistics below provide further insight both into your performance and
      into the effectiveness of your gear and stats.
      <br />
      <br />
      If you have questions about the output, please ask in the <code>
        #protection-questions
      </code>{' '}
      channel of the <a href="https://discord.gg/0dvRDgpa5xZHFfnD">Hammer of Wrath</a>. If you have
      theorycrafting questions or want to contribute, feel free to ask in <code>#protection</code>.
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    '/report/HPhcYD4FVQ8CwXpL/27-Heroic+One-Armed+Bandit+-+Kill+(5:40)/Auhken/standard/overview',
  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.PROTECTION_PALADIN,
  // The contents of your changelog.
  changelog: [], // CHANGELOG,
  // The CombatLogParser class for your spec.
  // parser: () =>
  //   import('./CombatLogParser' /* webpackChunkName: "ProtectionPaladin" */).then(
  //     (exports) => exports.default,
  //   ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};
