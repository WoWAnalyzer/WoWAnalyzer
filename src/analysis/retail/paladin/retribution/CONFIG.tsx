import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import Config, { SupportLevel } from 'parser/Config';

import CHANGELOG from './CHANGELOG';
import { Texleretour } from 'CONTRIBUTORS';

const config: Config = {
  contributors: [Texleretour],
  branch: GameBranch.Retail,
  patchCompatibility: '12.0.0',
  supportLevel: SupportLevel.MaintainedPartial,
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
      <a href="https://discord.com/invite/hammerofwrath" target="_blank" rel="noopener noreferrer">
        Hammer of Wrath Paladin Discord
      </a>
      . The <kbd>#ret-faq</kbd> channel has some useful guides, people can answer your
      interrogations in <kbd>#ret-questions</kbd> and the <kbd>#ret-general</kbd> has lots of memes
      if you're into that.
      <br />
      <br />
      In-depth guides are available at{' '}
      <a href="https://www.wowhead.com/retribution-paladin-guide">Wowhead</a> and{' '}
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
    '/report/9VPGaQY84MzWfZAx/10-Mythic+Fractillus+-+Kill+(1:17)/9-Âjax/standard/overview',

  spec: SPECS.RETRIBUTION_PALADIN,
  changelog: CHANGELOG,
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "RetributionPaladin" */).then(
      (exports) => exports.default,
    ),
  path: import.meta.url,
};

export default config;
