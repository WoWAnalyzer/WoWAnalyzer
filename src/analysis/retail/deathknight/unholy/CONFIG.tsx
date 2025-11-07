import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import Config, { SupportLevel } from 'parser/Config';
// import CHANGELOG from './CHANGELOG';
import { Brandrewsss } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/deathknight';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Brandrewsss],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '11.2.0',
  supportLevel: SupportLevel.MaintainedPartial,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      <p>
        Unholy Death Knights are disease specialists and undead masters, they turn rot and plague
        into damage. The specialization focuses on spreading and bursting{' '}
        <SpellLink spell={SPELLS.FESTERING_WOUND} /> and maintaining{' '}
        <SpellLink spell={SPELLS.VIRULENT_PLAGUE} />.
      </p>
      <p>
        Efficient resource use and cooldown alignment are key. Whether in AoE or single-target
        encounters, your damage hinges on controlling your minions, maximizing uptime on diseases,
        and capitalizing on procs and runic power spikes.
      </p>
      <p>
        If you have any feedback, find any issues, or have something you would like to see added,
        you can open an issue on{' '}
        <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/new">GitHub</a> or contact us on{' '}
        <a href="https://discord.gg/AxphPxU">Discord</a>.
      </p>
      <p>
        Make sure to check out the{' '}
        <a href="https://discord.gg/acherus">Death Knight Class Discord</a> if you need more
        specific advice or a more detailed guide than the ones available on{' '}
        <a href="https://www.icy-veins.com/wow/unholy-death-knight-pve-dps-guide">Icy Veins</a> or{' '}
        <a href="https://www.wowhead.com/unholy-death-knight-guide">Wowhead</a>.
      </p>
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    '/report/qHX2tmrGzkyB4cdL/49-Mythic+Dimensius,+the+All-Devouring+-+Kill+(9:04)/350-Vairuhdk/standard',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.UNHOLY_DEATH_KNIGHT,
  // The contents of your changelog.
  changelog: [], // CHANGELOG,
  // The CombatLogParser class for your spec.
  // parser: () =>
  //   import('./CombatLogParser' /* webpackChunkName: "UnholyDeathKnight" */).then(
  //     (exports) => exports.default,
  //   ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default config;
