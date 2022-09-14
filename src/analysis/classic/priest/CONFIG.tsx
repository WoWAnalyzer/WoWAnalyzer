import { t } from '@lingui/macro';
import { Khadaj } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import PRIMARY_STATS from 'game/PRIMARY_STATS';
import ROLES from 'game/ROLES';
import { Icon } from 'interface';
import Config from 'parser/Config';

import CHANGELOG from './CHANGELOG';
import lowRankSpells from './lowRankSpells';
import * as SPELLS from './SPELLS';

export enum Build {
  DEFAULT = 'default',
  DISC = 'disc',
  HOLY = 'holy',
  SHADOW = 'shadow'
}

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Khadaj],
  expansion: Expansion.WrathOfTheLichKing,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '3.4.0',
  isPartial: false,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: <>Proof of Concept analysis for TBCC Priests.</>,
  pages: {
    overview: {
      hideChecklist: false,
      text: <>TBC support is still a Work in Progress.</>,
      type: 'info',
    },
  },
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    '/report/mDyrvWa7QHzN2jFM/50-Normal+Morogrim+Tidewalker+-+Kill+(6:25)/Ratherbebelf',
  builds: {
    [Build.DEFAULT]: {
      url: 'standard',
      name: '20/41/0',
      talents: [20, 41, 0],
      icon: <Icon icon="spell_holy_summonlightwell" />,
      visible: true,
    },
    [Build.DISC]: {
      url: 'disc',
      name: '51/41/0',
      talents: [54, 7, 0],
      icon: <Icon icon="spell_holy_summonlightwell" />,
      visible: true,
    },
  },
  timeline: {
    separateCastBars: [
      [
        SPELLS.RENEW,
        ...lowRankSpells[SPELLS.RENEW],
        SPELLS.POWER_WORD_SHIELD,
        ...lowRankSpells[SPELLS.POWER_WORD_SHIELD],
        SPELLS.PRAYER_OF_MENDING,
        SPELLS.CIRCLE_OF_HEALING,
        ...lowRankSpells[SPELLS.CIRCLE_OF_HEALING],
      ],
      [
        SPELLS.FLASH_HEAL,
        ...lowRankSpells[SPELLS.FLASH_HEAL],
        SPELLS.GREATER_HEAL,
        ...lowRankSpells[SPELLS.GREATER_HEAL],

        SPELLS.PRAYER_OF_HEALING,
        ...lowRankSpells[SPELLS.PRAYER_OF_HEALING],
      ],
      [
        SPELLS.SHOOT,
        SPELLS.SMITE,
        ...lowRankSpells[SPELLS.SMITE],
        SPELLS.SHADOW_WORD_PAIN,
        ...lowRankSpells[SPELLS.SHADOW_WORD_PAIN],
        SPELLS.SHADOW_WORD_DEATH,
        ...lowRankSpells[SPELLS.SHADOW_WORD_DEATH],
        SPELLS.MIND_BLAST,
        ...lowRankSpells[SPELLS.MIND_BLAST],
        SPELLS.HOLY_FIRE,
        ...lowRankSpells[SPELLS.HOLY_FIRE],
      ],
      [SPELLS.SHADOW_FIEND, SPELLS.RESTORE_MANA],
    ],
  },

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: {
    id: 0,
    type: 'Priest',
    index: 35,
    className: t({
      id: 'className.priest',
      message: `Priest`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 12,
      spec: 2,
    },
  },
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "TBCPriest" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};

export default config;
