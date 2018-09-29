import React from 'react';

import { Oratio, Reglitch, Zerotorescue } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-09-14'),
    changes: <React.Fragment>Fixed the <SpellLink id={SPELLS.TWIST_OF_FATE_TALENT_DISCIPLINE.id} /> analyzer.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-31'),
    changes: <React.Fragment>Rework of the <SpellLink id={SPELLS.GRACE.id} /> module.</React.Fragment>,
    contributors: [Oratio],
  },
  {
    date: new Date('2018-07-26'),
    changes: <React.Fragment>Added support for the new <SpellLink id={SPELLS.PENANCE_CAST.id} /> event, thanks Blizzard.</React.Fragment>,
    contributors: [Reglitch],
  },
  {
    date: new Date('2018-07-19'),
    changes: <React.Fragment>Fixed <SpellLink id={SPELLS.SINS_OF_THE_MANY_TALENT.id} /> bug.</React.Fragment>,
    contributors: [Oratio],
  },
  {
    date: new Date('2018-07-24'),
    changes: <React.Fragment>Fix crash when using <SpellLink id={SPELLS.LUMINOUS_BARRIER_TALENT.id} />.</React.Fragment>,
    contributors: [Reglitch],
  },
  {
    date: new Date('2018-07-18'),
    changes: <React.Fragment>Now with 100% more Batle for Azeroth.</React.Fragment>,
    contributors: [Reglitch],
  },
];
