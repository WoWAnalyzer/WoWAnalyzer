import { Arlie, Putro } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';
import Config from 'parser/Config';
import CHANGELOG from './CHANGELOG';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Putro, Arlie],
  expansion: Expansion.Dragonflight,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '10.1.7',
  isPartial: false,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hello and welcome to the Beast Mastery Hunter analyzer! I hope that the suggestions given will
      be helpful in aiding you improve your overall performance. Try and focus on improving only a
      few things at a time, until those become ingrained in your muscle memory so as to not be
      concentrating on many different things.
      <br />
      <br />
      If you want to learn more about Beast Mastery Hunters, join the Hunter community on the
      Trueshot Lodge Discord:{' '}
      <a href="https://www.discord.gg/trueshot" target="_blank" rel="noopener noreferrer">
        discord.gg/trueshot
      </a>
      . The <kbd>#beast-mastery</kbd> channel has a lot of helpful people, and if you post your logs
      in <kbd>#log-reviews</kbd>, you can expect to get some good pointers for improvement from the
      community.
      <br />
      <br />
      For general gameplay guides and tips, please refer to the{' '}
      <a
        href="https://www.wowhead.com/guide/classes/hunter/beast-mastery/overview-pve-dps"
        target="_blank"
        rel="noopener noreferrer"
      >
        Wowhead
      </a>{' '}
      or{' '}
      <a
        href="https://www.icy-veins.com/wow/beast-mastery-hunter-pve-dps-guide"
        target="_blank"
        rel="noopener noreferrer"
      >
        Icy-veins
      </a>{' '}
      guide.
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/zrb9CRPkhn2TpFyK/4-Heroic+Kazzara,+the+Hellforged+-+Kill+(2:00)/Ispase',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.BEAST_MASTERY_HUNTER,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "BeastMasteryHunter" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,

  //Guide is NOT default while being developed and tested
  guideDefault: true,
  //Guide only will turn true when guide is ready to be published and replace checklist fully
  guideOnly: false,
};

export default config;
