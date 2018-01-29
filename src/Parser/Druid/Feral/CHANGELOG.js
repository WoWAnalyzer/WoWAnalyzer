import React from 'react';

import { Thieseract, Anatta336 } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  { 
    date: new Date('2018-01-29'),
    changes: <Wrapper>Added low energy <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> tracking</Wrapper>,
    contributors: [Anatta336],
  },
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
