import { bdfreeman1421 } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';
import { Icon } from 'interface';
import Config from 'parser/Config';

import CHANGELOG from './CHANGELOG';

export enum Build {
  DEFAULT = 'default',
  SURVIVAL = 'survival',
}

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [bdfreeman1421],
  expansion: Expansion.WrathOfTheLichKing,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '3.4.0',
  isPartial: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: <>Classic WotLK support is still a Work in Progress.</>,
  pages: {
    overview: {
      hideChecklist: false,
      text: <>Classic WotLK support is still a Work in Progress.</>,
      type: 'info',
    },
  },
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/8AaZGQvkzJdDYfMR/11-Normal+Magtheridon+-+Kill+(7:42)/Badmera',
  builds: {
    [Build.DEFAULT]: {
      url: 'standard',
      name: '0/18/53',
      talents: [0, 18, 53],
      icon: <Icon icon="ability_hunter_explosiveshot" />,
      visible: true,
    },
    [Build.SURVIVAL]: {
      url: 'survival',
      name: '0/18/53',
      talents: [0, 18, 53],
      icon: <Icon icon="ability_hunter_explosiveshot" />,
      visible: true,
    },
  },
  timeline: { separateCastBars: [[]] },

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.CLASSIC_HUNTER_SURVIVAL,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "ClassicSurvivalHunter" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};

export default config;