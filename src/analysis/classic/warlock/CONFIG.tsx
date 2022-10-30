import { t } from '@lingui/macro';
import { Khadaj, Talador12 } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import PRIMARY_STATS from 'game/PRIMARY_STATS';
import ROLES from 'game/ROLES';
import { Icon } from 'interface';
import Config from 'parser/Config';
import CHANGELOG from './CHANGELOG';

export enum Build {
  DEFAULT = 'default',
  AFFLICTION = 'affliction',
  DEMO = 'demo',
  DESTRO = 'destro',
}

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Khadaj, Talador12],
  expansion: Expansion.WrathOfTheLichKing,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '3.4.0',
  isPartial: false,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: <>Analysis for WOTLK Warlocks.</>,
  pages: {
    overview: {
      hideChecklist: false,
      text: <>WOTLK support is still a Work in Progress.</>,
      type: 'info',
    },
  },
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/8Q6FBDPnRJ9yMNbd/24-Normal+Patchwerk+-+Kill+(2:35)/Jazminites',
  builds: {
    [Build.DEFAULT]: {
      url: 'standard',
      name: '0/10/56',
      talents: [0, 21, 50],
      icon: <Icon icon="spell_shadow_shadowbolt" />,
      visible: true,
    },
    [Build.AFFLICTION]: {
      url: 'affliction',
      name: '55/0/16',
      talents: [55, 0, 16],
      icon: <Icon icon="spell_shadow_deathcoil" />,
      visible: true,
    },
    [Build.DEMO]: {
      url: 'demo',
      name: '0/56/15',
      talents: [0, 56, 15],
      icon: <Icon icon="spell_shadow_metamorphosis" />,
      visible: true,
    },
    [Build.DESTRO]: {
      url: 'destro',
      name: '0/10/56',
      talents: [0, 10, 56],
      icon: <Icon icon="spell_shadow_rainoffire" />,
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
    type: 'Warlock',
    index: 27,
    className: t({
      id: 'className.warlock',
      message: `Warlock`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 13,
      spec: 3,
    },
  },
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "ClassicWarlock" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};

export default config;
