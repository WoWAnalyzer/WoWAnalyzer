<<<<<<< HEAD
import React from 'react';

import { Thieseract, Anatta336 } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  { 
    date: new Date('2018-01-24'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.ASHAMANES_RIP.id} /> uptime tracking</Wrapper>,
    contributors: [Anatta336],
  },
  { 
    date: new Date('2017-09-22'),
    changes: 'Added 5 combo point finisher tracking',
    contributors: [Thieseract],
  },
  { 
    date: new Date('2017-09-11'),
    changes: 'Refactored combo point tracking properties',
    contributors: [Thieseract],
  },
  { 
    date: new Date('2017-09-11'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.SAVAGE_ROAR_TALENT.id} icon /> damage contribution</Wrapper>,
    contributors: [Thieseract],
  },
  { 
    date: new Date('2017-09-10'),
    changes: 'Changed exceptions to conditional assignment on combo point tracker',
    contributors: [Thieseract],
  },
  { 
    date: new Date('2017-09-06'),
    changes: 'Updated combo point tracking to handle non standard generator and spenders',
    contributors: [Thieseract],
  },
  { 
    date: new Date('2017-09-04'),
    changes: 'Cleaned up this.owner modules where possible',
    contributors: [Thieseract],
  },
  { 
    date: new Date('2017-09-04'),
    changes: 'Added combo point tracking',
    contributors: [Thieseract],
  },
  { 
    date: new Date('2017-09-04'),
    changes: 'Added bleed uptime tracking',
    contributors: [Thieseract],
  },
  { 
    date: new Date('2017-09-04'),
    changes: 'CooldownTracker configured',
    contributors: [Thieseract],
  },
  { 
    date: new Date('2017-09-03'),
    changes: 'Initial commit. Damage done, ABC, and Abilities added',
    contributors: [Thieseract],
  },
];
=======
export default `
26-01-2018 - Feral Druid: Added low energy Ferocious Bite tracking (by Anatta336).
24-01-2018 - Feral Druid: Added Ashamane's Rip uptime tracking (by Anatta336).
22-09-2019 - Feral Druid: Added 5 combo point finisher tracking (by Thieseract).
11-09-2019 - Feral Druid: Refactored combo point tracking properties (by Thieseract).
11-09-2019 - Feral Druid: Added Savage Roar damage contribution (by Thieseract).
10-09-2019 - Feral Druid: Changed exceptions to conditional assignment on combo point tracker (by Thieseract).
06-09-2017 - Feral Druid: Updated combo point tracking to handle non standard generator and spenders (by Thieseract).
04-09-2017 - Feral Druid: Cleaned up this.owner modules where possible (by Thieseract).
04-09-2017 - Feral Druid: Added combo point tracking (by Thieseract).
04-09-2017 - Feral Druid: Added bleed uptime tracking (by Thieseract).
04-09-2017 - Feral Druid: CooldownTracker configured (by Thieseract).
03-09-2017 - Feral Druid: Initial commit. Damage done, ABC, and Abilities added (by Thieseract).
`;
>>>>>>> add tracking of low energy ferocious bite use
