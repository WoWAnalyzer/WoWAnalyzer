import { t } from '@lingui/macro';
import { Zerotorescue } from 'CONTRIBUTORS';
import PRIMARY_STATS from 'game/PRIMARY_STATS';
import ROLES from 'game/ROLES';
import { Icon } from 'interface';
import Config from 'parser/Config';
import React from 'react';

import CHANGELOG from './CHANGELOG';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Zerotorescue],
  // The WoW client patch this spec was last updated.
  patchCompatibility: '2.0.0',
  isPartial: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: <>Proof of Concept analysis for BM Hunters.</>,
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/Dd4mA7LtyGqhCanN/10-Heroic+Hungering+Destroyer+-+Kill+(4:04)/Sucker',
  builds: {
    default: {
      url: 'standard',
      name: '41/20/0',
      icon: <Icon icon="ability_hunter_mendpet" />,
      visible: true,
    },
  },

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: {
    id: 0,
    type: 'Hunter',
    index: 35,
    className: t({
      id: 'className.hunter',
      message: `Hunter`,
    }),
    role: ROLES.TANK,
    primaryStat: PRIMARY_STATS.AGILITY,
    ranking: {
      class: 12,
      spec: 2,
    },
  },
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "TBCHunter" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};

export default config;
