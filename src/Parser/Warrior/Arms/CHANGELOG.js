import React from 'react';

import { TheBadBossy, Aelexe } from 'CONTRIBUTORS';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-04-05'),
    changes: <Wrapper>Implemented <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> and <SpellLink id={SPELLS.COLOSSUS_SMASH.id} icon /> haste cooldown reductions, <SpellLink id={SPELLS.TITANIC_MIGHT_TALENT.id} icon /> cooldown reduction, <SpellLink id={SPELLS.TACTICIAN.id} icon /> cooldown resets, <SpellLink id={SPELLS.IN_FOR_THE_KILL_TALENT.id} icon /> haste buff, <SpellLink id={SPELLS.BLADESTORM.id} icon /> channeling, removed <SpellLink id={SPELLS.CHARGE.id} icon /> and <SpellLink id={SPELLS.HEROIC_LEAP.id} icon /> from the global cooldown, and a bunch of other things.</Wrapper>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2017-10-21'),
    changes: 'Added tactician procs.',
    contributors: [TheBadBossy],
  },
  {
    date: new Date('2017-10-19'),
    changes: 'Added initial support.',
    contributors: [TheBadBossy],
  },
];
