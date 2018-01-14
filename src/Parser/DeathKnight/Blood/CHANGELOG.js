import React from 'react';

import { Yajinni } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
    {
      date: new Date('2017-10-23'),
      changes: 'Filtered some unnecessary spells from CD tracking.',
      contributors: [Yajinni],
    },
    {
      date: new Date('2017-10-03'),
      changes: <Wrapper>Updated cast efficency ratios and text. Added CD tracking for <SpellLink id={SPELLS.VAMPIRIC_BLOOD.id} icon /> and <SpellLink id={SPELLS.DANCING_RUNE_WEAPON.id} icon />.</Wrapper>,
      contributors: [Yajinni],
    },
    {
      date: new Date('2017-09-14'),
      changes: 'Added runic power graphs/table.',
      contributors: [Yajinni],
    },
    {
      date: new Date('2017-09-12'),
      changes: <Wrapper>Added <SpellLink id={SPELLS.BLOOD_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id} /> and <SpellLink id={SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id} /> tracking. Talent checking/filtering.</Wrapper>,
      contributors: [Yajinni],
    },
    {
      date: new Date('2017-09-09'),
      changes: <Wrapper>Added <SpellLink id={SPELLS.BLOODDRINKER_TALENT.id} icon /> tracking and updated statistic wording.</Wrapper>,
      contributors: [Yajinni],
    },
    {
      date: new Date('2017-09-07'),
      changes: <Wrapper>Updated haste calculates for spells. Added <SpellLink id={SPELLS.BONE_SHIELD.id} icon /> haste buff too.</Wrapper>,
      contributors: [Yajinni],
    },
    {
      date: new Date('2017-09-04'),
      changes: 'Initial Blood Death Knight',
      contributors: [Yajinni],
    },
];
