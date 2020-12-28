import React from 'react';
import { LeoZhekov, flurreN } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  change(date(2020, 12, 28), <>Added support for <SpellLink id={SPELLS.GLAIVE_TEMPEST_TALENT.id} /> </>, flurreN),
  change(date(2020, 12, 23), 'Updated spells and talents for SL', [flurreN]),
  change(date(2020, 10, 30), 'Updated the deprecated StatisticBox elements with the new Statistic ones.', [LeoZhekov]),
];
