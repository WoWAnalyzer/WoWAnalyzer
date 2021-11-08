import { t } from '@lingui/macro';
import { Arbixal, Khadaj } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import PRIMARY_STATS from 'game/PRIMARY_STATS';
import ROLES from 'game/ROLES';
import { Icon } from 'interface';
import Config from 'parser/Config';
import React from 'react';

import CHANGELOG from './CHANGELOG';

export enum Build {
  DEFAULT = 'default',
  ELEMENTAL = 'elemental',
  ENHANCEMENT = 'enhancement',
}

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Khadaj, Arbixal],
  expansion: Expansion.TheBurningCrusade,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '2.5.1',
  isPartial: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: <>Proof of Concept analysis for TBCC Resto Shamans.</>,
  pages: {
    overview: {
      hideChecklist: false,
      text: <>TBC support is still a Work in Progress.</>,
      type: 'info',
    },
  },
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/mDyrvWa7QHzN2jFM/50-Normal+Morogrim+Tidewalker+-+Kill+(6:25)/Primalheals',
  builds: {
    [Build.DEFAULT]: {
      url: 'standard',
      name: '0/5/56',
      icon: <Icon icon="spell_nature_healingwavegreater" />,
      visible: true,
    },
    [Build.ENHANCEMENT]: {
      url: 'enhancement',
      name: '2/45/14',
      icon: <Icon icon="spell_nature_lightningshield" />,
      visible: true,
    },
    [Build.ELEMENTAL]: {
      url: 'elemental',
      name: '41/0/20',
      icon: <Icon icon="spell_nature_lightning" />,
      visible: true,
    },
  },
  timeline: {
    separateCastBars: [[]],
  },

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: {
    id: 0,
    type: 'Shaman',
    index: 27,
    className: t({
      id: 'className.shaman',
      message: `Shaman`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 9,
      spec: 3,
    },
  },
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "TBCShaman" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};

export default config;
