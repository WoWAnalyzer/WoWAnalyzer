import React from 'react';

import { Zerotorescue } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-08-05'),
    changes: <>Fixed a bug where the Haste gained from <SpellLink id={SPELLS.VOIDFORM_BUFF.id} /> was never removed when not using <SpellLink id={SPELLS.LINGERING_INSANITY_TALENT.id} />.</>,
    contributors: [Zerotorescue],
    clIndex: 'Shadow20180805.2',
  },
  {
    date: new Date('2018-08-05'),
    changes: <>Fixed crash when using <SpellLink id={SPELLS.DARK_ASCENSION_TALENT.id} />.</>,
    contributors: [Zerotorescue],
    clIndex: 'Shadow20180805.1',
  },
  {
    date: new Date('2018-06-22'),
    changes: 'Updated spells and several modules to be compatible with BFA.',
    contributors: [Zerotorescue],
    clIndex: 'Shadow20180622.1',
  },
];
