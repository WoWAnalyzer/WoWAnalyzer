import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { Juko8 } from 'CONTRIBUTORS';

export default [
  {
    date: new Date('2018-10-04'),
    changes: <React.Fragment> Added <SpellLink id={SPELLS.DIVINE_RIGHT.id} /> </React.Fragment>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-09-20'),
    changes: <> Added <SpellLink id={SPELLS.RELENTLESS_INQUISITOR.id} /> </>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-09-17'),
    changes: <> Added <SpellLink id={SPELLS.SHIELD_OF_VENGEANCE.id} /> </>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-06-25'),
    changes: <>Added modules for <SpellLink id={SPELLS.RIGHTEOUS_VERDICT_TALENT.id} icon /> and <SpellLink id={SPELLS.INQUISITION_TALENT.id} icon /> </>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-06-24'),
    changes: <>Updated modules for <SpellLink id={SPELLS.ART_OF_WAR.id} icon /> and <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon /></>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-06-21'),
    changes: 'Talents and abilities updated for 8.0. Artifact traits and related analysis removed',
    contributors: [Juko8],
  },
];
