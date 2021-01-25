import React from 'react';

import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { Juko8, Skeletor, Zeboot, Hordehobbs } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 12, 1), <>Added <SpellLink id={SPELLS.SANCTIFIED_WRATH_TALENT_RETRIBUTION.id} icon /> module and minor housekeeping.</>, Skeletor),
  change(date(2020, 11, 8), <>Added <SpellLink id={SPELLS.EMPYREAN_POWER_TALENT.id} icon /> module.</>, Skeletor),
  change(date(2020, 11, 7), <>Added <SpellLink id={SPELLS.HOLY_AVENGER_TALENT.id} icon /> module from new Shared module.</>, Skeletor),
  change(date(2020, 11, 7), <>Updated <SpellLink id={SPELLS.DIVINE_PURPOSE_TALENT.id} icon /> module to new Shared module.</>, Skeletor),
  change(date(2020, 11, 7), 'Core and Talent modules converted to TypeScript', Skeletor),
  change(date(2020, 11, 6), 'General housekeeping and ability updates.', Skeletor),
  change(date(2020, 10, 23), <>Aggregate Prot and Ret <SpellLink id={SPELLS.JUDGMENT_CAST.id} /> analyzers into single analyzer.</>, Hordehobbs),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 17), <>Updated <SpellLink id={SPELLS.HAMMER_OF_WRATH.id} icon /> max casts calculation to account for execute restrictions and added cast efficiency tracking</>, Juko8),
  change(date(2020, 9, 18), 'Removed BFA stuff and updated most things for 9.0', Juko8),
];
