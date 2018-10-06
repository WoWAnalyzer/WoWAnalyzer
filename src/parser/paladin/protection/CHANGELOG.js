import React from 'react';
import { emallson } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('6 October 2018'),
    contributors: [emallson],
    changes: <React.Fragment>Added support for <SpellLink id={SPELLS.INSPIRING_VANGUARD.id} />, including the ability to exactly detect <SpellLink id={SPELLS.GRAND_CRUSADER.id} /> resets when this trait is taken.</React.Fragment>,
  },
];
