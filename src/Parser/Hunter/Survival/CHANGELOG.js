import React from 'react';

import { Putro } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

export default [
  {
    date: new Date('2018-01-30'),
    changes: <Wrapper>Added two statistic modules for <SpellLink id={SPELLS.MONGOOSE_FURY.id} icon /></Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-30'),
    changes: 'Added a focus usage chart to track what you\'re spending your focus on',
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-18'),
    changes: <Wrapper>Added support for <SpellLink id={SPELLS.HUNTER_SV_T20_2P_BONUS.id} icon />, <SpellLink id={SPELLS.HUNTER_SV_T20_4P_BONUS.id} icon />, <SpellLink id={SPELLS.HUNTER_SV_T21_2P_BONUS.id} icon />, <SpellLink id={SPELLS.HUNTER_SV_T21_4P_BONUS.id} icon />.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-17'),
    changes: 'Initial support of survival.',
    contributors: [Putro],
  },
];
