import React from 'react';

import { Gebuz } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  { 
    date: new Date('2018-8-26'),
    changes: 'Updated the empowerment tracker to use the new log format for the buff.',
    contributors: [Gebuz],
  },
  { 
    date: new Date('2018-6-21'),
    changes: <React.Fragment>Removed Stellar Empowerment and added haste tracker for <SpellLink id={SPELLS.STARLORD_TALENT.id} /></React.Fragment>,
    contributors: [Gebuz],
  },
];
