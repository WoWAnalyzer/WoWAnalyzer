import { Juko8, Klamuz, Skeletor, ToppleTheNun } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';
import Config from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const config: Config = {
  contributors: [ToppleTheNun, Klamuz, Juko8, Skeletor],
  expansion: Expansion.Dragonflight,
  patchCompatibility: '10.1.7',
  isPartial: true,
  description: (
    <>
      We hope you get some use out this analyzer we have been working on.
      <br />
      <br />
      The best general piece of advice is to ensure you're keeping your abilities on CD and not
      wasting Holy Power.
      <br />
      <br />
      If you want to learn more about Retribution Paladins make sure to also check out the{' '}
      <a
        href="https://discordapp.com/invite/hammerofwrath"
        target="_blank"
        rel="noopener noreferrer"
      >
        Hammer of Wrath Paladin Discord
      </a>
      . The <kbd>#ret-read-first</kbd> channel has some useful guides and the{' '}
      <kbd>#ret-general</kbd> has lots of memes if you're into that.
      <br />
      <br />
      In-depth guides are available at{' '}
      <a href="https://www.retpaladin.xyz/ret-paladin-pve-guide/">RetPaladin.XYZ</a>,{' '}
      <a href="https://www.wowhead.com/retribution-paladin-guide">Wowhead</a>, and{' '}
      <a href="http://www.icy-veins.com/wow/retribution-paladin-pve-dps-guide">Icy Veins</a>. These
      guides also feature encounter specific tips to help you improve. Look for them in the
      navigation bar/panels.
      <br />
      <br />
      Feel free to message us on discord or on GitHub with any bugs or ideas for things we could
      work on!
    </>
  ),
  exampleReport:
    '/report/zv8KTrVGJbnmD2PX/1-Mythic++Brackenhide+Hollow+-+Kill+(18:56)/Wogmyhog/standard/overview',
  guideDefault: true,
  guideOnly: true,

  spec: SPECS.RETRIBUTION_PALADIN,
  changelog: CHANGELOG,
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "RetributionPaladin" */).then(
      (exports) => exports.default,
    ),
  path: import.meta.url,
};

export default config;
