import { niseko, HawkCorrigan } from 'CONTRIBUTORS';

import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-11-13'),
    changes: <>Added a basic Checklist, with the cross-spec functionalities.</>,
    contributors: [HawkCorrigan],
  },
  {
    date: new Date('2018-11-04'),
    changes: <>Added support for <SpellLink id={SPELLS.PACK_SPIRIT_TRAIT.id} /> and <SpellLink id={SPELLS.SERENE_SPIRIT_TRAIT.id} /> azerite traits.</>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-11-01'),
    changes: <>Added support for <SpellLink id={SPELLS.ASTRAL_SHIFT.id} /> damage reduction.</>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-10-17'),
    changes: <>Flagged the Elemental Shaman Analyzer as supported.</>,
    contributors: [HawkCorrigan],
  },
  {
    date: new Date('2018-10-15'),
    changes: <>Added Checks for the correct usage of <SpellLink id={SPELLS.STORM_ELEMENTAL_TALENT.id} /> and <SpellLink id={SPELLS.FIRE_ELEMENTAL.id} /> when talented into <SpellLink id={SPELLS.PRIMAL_ELEMENTALIST_TALENT.id} />.</>,
    contributors: [HawkCorrigan],
  },
];
