import TALENTS from 'common/TALENTS/paladin';
import { swirl, Texleretour } from 'CONTRIBUTORS';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import { SpellLink } from 'interface';
import Config, { SupportLevel } from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const config: Config = {
  contributors: [Texleretour, swirl],
  branch: GameBranch.Retail,
  patchCompatibility: '11.1.5',
  supportLevel: SupportLevel.MaintainedPartial,
  description: (
    <>
      Hey! I hope the suggestions will help you improve your performance. Remember: focus on
      improving only one or two important things at a time. Improving isn't easy and will need your
      full focus until it becomes second nature to you.
      <br />
      <br />
      You might have noticed the suggestions focus mostly on improving your cast efficiencies. This
      might seem silly, but it's actually one of the most important things for us Holy Paladins.
      Avoid having your <SpellLink spell={TALENTS.AVENGING_WRATH_TALENT} /> and other cooldowns
      available unused for long periods of time (they're not raid cooldowns, they're required for
      you to have decent throughput and not run OOM) and <b>hit those buttons</b> that have short
      cooldowns (such as <SpellLink spell={TALENTS.HOLY_SHOCK_TALENT} /> and{' '}
      <SpellLink spell={TALENTS.HOLY_PRISM_TALENT} />
      ).
      <br />
      <br />
      If you want to learn more about Holy Paladins, join the Paladin community at the{' '}
      <a
        href="https://discordapp.com/invite/hammerofwrath"
        target="_blank"
        rel="noopener noreferrer"
      >
        Hammer of Wrath discord
      </a>
      . The <kbd>#holy-faq</kbd> channel has a lot of useful information including links to good
      guides.
    </>
  ),
  exampleReport: '/report/tTkV1MWxgDmrvJnh/8/62',

  spec: SPECS.HOLY_PALADIN,
  changelog: CHANGELOG,
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "HolyPaladin" */).then(
      (exports) => exports.default,
    ),
  path: import.meta.url,
};

export default config;
