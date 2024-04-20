import { Carrottopp, Toreole } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';
import TALENTS from 'common/TALENTS/warrior';
import Config from 'parser/Config';
import { AlertWarning, SpellLink } from 'interface';

import CHANGELOG from './CHANGELOG';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Carrottopp, Toreole],
  expansion: Expansion.Dragonflight,
  // The WoW client patch this spec was last updated.
  patchCompatibility: null,
  isPartial: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      <AlertWarning>
        The APL is still a mess right now, so do not pay attention to the Rotation Efficiency, or
        the Suggestions in the Timeline.
      </AlertWarning>
      <AlertWarning>
        The 'Rage usage' breakdown currently uses the wrong amount of Rage spent for Slam when using{' '}
        <SpellLink spell={TALENTS.BARBARIC_TRAINING_ARMS_TALENT} />.
      </AlertWarning>
      Hey I've been hard at work making this analyzer for you. I hope the suggestions give you
      useful pointers to improve your performance. Remember: focus on improving only one or two
      important things at a time. Improving isn't easy and will need your full focus until it
      becomes second nature to you.
      <br />
      <br />
      We are always looking to improve the Arms Warrior Analyzers and Modules; so if you find any
      issues or if there is something missing that you would like to see added, please open an Issue
      on <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/new">GitHub</a> or send a
      message to Matardarix on <a href="https://discord.gg/AxphPxU">Discord</a> (Matardarix#9847){' '}
      <br /> <br />
      Make sure to check out the{' '}
      <a href="https://discordapp.com/invite/Skyhold">Warrior Class Discord</a> if you need more
      specific advice or a more detailed guide than the ones available on{' '}
      <a href="https://www.icy-veins.com/wow/arms-warrior-pve-dps-guide">Icy-Veins</a> and{' '}
      <a href="https://www.wowhead.com/arms-warrior-guide">wowhead</a>.<br />
      <br />
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: 'report/B9MWAXq3hFc2znHD/8-Mythic+Terros+-+Kill+(5:28)/Shakeywar/standard',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.ARMS_WARRIOR,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "ArmsWarrior" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default config;
