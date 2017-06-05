import React from 'react';

import SPECS from 'common/SPECS';

import PatreonLink from 'Main/PatreonLink';

import CombatLogParser from './CombatLogParser';

export default {
  spec: SPECS.DISCIPLINE_PRIEST,
  parser: CombatLogParser,
  maintainer: '@Reglitch',
  footer: (
    <div>
      Please consider donating to help out further development.<br />
      <PatreonLink />
    </div>
  ),
};
