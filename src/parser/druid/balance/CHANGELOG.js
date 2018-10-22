import React from 'react';

import { Gebuz } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-8-26'),
    changes: 'Updated the empowerment tracker to use the new log format for the buff.',
    contributors: [Gebuz],
    clIndex: 'Balance20180826.1',
  },
  {
    date: new Date('2018-6-21'),
    changes: <>Removed Stellar Empowerment and added haste tracker for <SpellLink id={SPELLS.STARLORD_TALENT.id} /></>,
    contributors: [Gebuz],
    clIndex: 'Balance20180621.1',
  },
];
