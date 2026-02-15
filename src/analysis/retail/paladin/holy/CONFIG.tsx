import TALENTS from 'common/TALENTS/paladin';
import { swirl, Texleretour } from 'CONTRIBUTORS';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import { SpellLink } from 'interface';
import Config, { SupportLevel } from 'parser/Config';
import CHANGELOG from './CHANGELOG';

const config: Config = {
  contributors: [swirl],
  branch: GameBranch.Retail,
  patchCompatibility: '12.0',
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
      Avoid having your cooldowns available sitting unused for long periods of time and{' '}
      <b>hit those buttons</b> that have short cooldowns (like
      <SpellLink spell={TALENTS.HOLY_SHOCK_TALENT} />
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
