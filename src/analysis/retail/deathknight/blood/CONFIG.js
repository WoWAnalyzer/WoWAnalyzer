import SPELLS from 'common/SPELLS';
import { Yajinni, joshinator } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';
import { SpellLink } from 'interface';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Yajinni, joshinator],
  expansion: Expansion.Shadowlands,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '9.0.5',
  isPartial: false,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Blood depends a lot on using his runes and how they're used in order to perform well.
      <br />
      Overusing <SpellLink id={SPELLS.MARROWREND.id} /> for example reduces the amount of runic
      power you can generate, directly affecting the amount of{' '}
      <SpellLink id={SPELLS.DEATH_STRIKE.id} />
      's.
      <br />
      <br />
      Not only the amount of <SpellLink id={SPELLS.DEATH_STRIKE.id} />
      's are important, timing is aswell. Make sure to check them in the 'Death Strike Timing'-tab
      below.
      <br />
      The rest of this analyzer focuses a lot on maximizing your damage output, buff uptimes,
      cooldown usage and more or less usefull statistics.
      <br />
      Your best defensive rotation is also your best offensive one, so optimizing your output means
      you'll optimize your survivability aswell.
      <br />
      <br />
      If you find any issues or have something you'd like to see added, open an issue on{' '}
      <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/new">GitHub</a>, contact us on{' '}
      <a href="https://discord.gg/AxphPxU">Discord</a> or DM us on Discord.
      <br />
      <br />
      Make sure to check out the <a href="https://goo.gl/qjTtNY">Death Knight Class Discord</a> if
      you need more specific advice or a more detailed guide than the ones available on{' '}
      <a href="https://www.icy-veins.com/wow/blood-death-knight-pve-tank-guide">Icy-Veins</a> and{' '}
      <a href="https://www.wowhead.com/blood-death-knight-guide">wowhead</a>.
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: "/report/mx1BaMV7PyL4FnKz/10-Mythic+Artificer+Xy'mox+-+Kill+(5:53)/Tombo/standard",

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.BLOOD_DEATH_KNIGHT,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "BloodDeathKnight" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
