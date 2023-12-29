import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { Abelito75 } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';
import { SpellLink } from 'interface';
import Config from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const config: Config = {
  contributors: [Abelito75],
  expansion: Expansion.Dragonflight,
  patchCompatibility: '10.1.7',
  isPartial: false,
  description: (
    <>
      Hey! I hope the suggestions will help you improve your performance. Remember: focus on
      improving only one or two important things at a time. Improving isn't easy and will need your
      full focus until it becomes second nature to you.
      <br />
      <br />
      You might have noticed the suggestions focus mostly on improving your cast efficiencies. This
      might seem silly, but it's actually one of the most important things for us Holy Paladins.
      Avoid having your <SpellLink spell={SPELLS.AVENGING_WRATH} /> and other cooldowns available
      unused for long periods of time (they're not raid cooldowns, they're required for you to have
      decent throughput and not run OOM) and <b>hit those buttons</b> that have short cooldowns
      (such as <SpellLink spell={TALENTS.HOLY_SHOCK_TALENT} /> and{' '}
      <SpellLink spell={TALENTS.LIGHT_OF_DAWN_TALENT} />
      ). Finally, don't cast <SpellLink spell={TALENTS.LIGHT_OF_THE_MARTYR_TALENT} /> unless there's
      nothing else to cast, or you're playing with{' '}
      <SpellLink spell={TALENTS.MARAADS_DYING_BREATH_TALENT} />
      .
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
  exampleReport:
    '/report/K3QhqX8brd7aHJn4/26-Mythic+The+Vigilant+Steward,+Zskarn+-+Kill+(4:15)/467-Mytholcgy/standard',

  //
  spec: SPECS.HOLY_PALADIN,
  changelog: CHANGELOG,
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "HolyPaladin" */).then(
      (exports) => exports.default,
    ),
  path: import.meta.url,
};

export default config;
