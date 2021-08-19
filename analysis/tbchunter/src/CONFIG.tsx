import { t } from '@lingui/macro';
import { Zerotorescue } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import PRIMARY_STATS from 'game/PRIMARY_STATS';
import ROLES from 'game/ROLES';
import { Icon, SpellLink } from 'interface';
import Config from 'parser/Config';
import React from 'react';

import CHANGELOG from './CHANGELOG';
import * as SPELLS from './SPELLS';

export enum Build {
  DEFAULT = 'default',
}

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Zerotorescue],
  expansion: Expansion.TheBurningCrusade,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '2.5.1',
  isPartial: false,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      This is the The Burning Crusade classic Hunter analysis. Because classic does not have the
      concept of "specs", analysis is active for the entire class even though not every spec may be
      supported. You can switch between different talent builds using the builds selection above the
      player name in the header. Currently only the standard Beast Mastery build is supported.
    </>
  ),
  pages: {
    overview: {
      hideChecklist: true,
      text: <>Only the Beast Mastery build is currently supported.</>,
      type: 'info',
    },
    timeline: (parser) =>
      parser.build === Build.DEFAULT
        ? {
            type: 'info',
            text: (
              <>
                The attack speed calculation for the timeline assumes 5/5 <SpellLink id={34470} />{' '}
                and a 15% Haste quiver. We can not be determine if you have these from the log. If
                you are missing either of these, the attack speed used in our Auto Shot calculations
                may be off.
              </>
            ),
          }
        : {
            type: 'danger',
            text: 'The Auto Shot cooldown is not accurate for this build.',
          },
  },
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/Dd4mA7LtyGqhCanN/10-Heroic+Hungering+Destroyer+-+Kill+(4:04)/Sucker',
  builds: {
    [Build.DEFAULT]: {
      url: 'standard',
      name: '41/20/0',
      icon: <Icon icon="ability_hunter_mendpet" />,
      visible: true,
    },
  },
  timeline: {
    separateCastBars: [[SPELLS.AUTO_SHOT]],
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
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.AGILITY,
    ranking: {
      class: 3,
      spec: 1,
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
