import React from 'react';

import { Putro } from 'MAINTAINERS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';

export default [
  {
    date: new Date('2017-12-22'),
    changes: <Wrapper>Added support for <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} icon /> and <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} icon /> and gave them suggestions. </Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-22'),
    changes: 'Updated to the new checklist format, and updated AlwaysBeCasting thresholds',
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-04'),
    changes: 'Added  talents and traits. Moved them into a singular box to improve visibility.',
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-03'),
    changes: 'Upgraded spec completeness to good, added t192p support, added t21 support and added a suggestion for Killer Cobra',
    contributors: [Putro],
  },
  {
    date: new Date('2017-11-01'),
    changes: 'Added Mark of the claw, Bestial Wrath modules, Dire Beast modules, Qapla module, Titan\'s Thunder module, Killer Cobra module.',
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-29'),
    changes: 'Added base files for Beast Mastery.',
    contributors: [Putro],
  },
];
