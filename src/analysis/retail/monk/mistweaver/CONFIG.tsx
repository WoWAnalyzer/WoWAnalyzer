import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import Config, { SupportLevel } from 'parser/Config';
import { Trevor, Vohrr } from 'CONTRIBUTORS';
import CHANGELOG from './CHANGELOG';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Trevor, Vohrr],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '11.0.2',
  supportLevel: SupportLevel.MaintainedFull,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hello all! Thanks so much for taking the time use this tool as a way to improve your play. The
      goal is to provide targeted suggestions to improve your overall Mistweaver Monk play. The
      suggestions are based on the current theorycrafting and practical knowledge from some of the
      best Mistweavers playing this game. (And even some former mistweavers who still like to help
      us dreamers out.)
      <br />
      <br />
      The tool is not perfect so we are always looking to improve it. If you have any suggestions or
      comments, don't hesitated to open an issue on the Github repo. Thanks and we hope you continue
      to enjoy the tool!
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    "report/8X7C6fYHZDkJtyc2/22-Mythic+Broodtwister+Ovi'nax+-+Wipe+10+(2:40)/Vohrrliance/standard/statistics",

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.MISTWEAVER_MONK,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "MistweaverMonk" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};
export default config;
