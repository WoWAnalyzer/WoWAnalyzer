import React from 'react';

import { emallson, Hordehobbs, Zeboot, HolySchmidt } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { change, date } from 'common/changelog';

export default [
  change(date(2021, 1, 3), <>Added ability tracking for <SpellLink id={SPELLS.FINAL_STAND_TALENT.id}/> and <SpellLink id={SPELLS.DIVINE_TOLL.id}/> for protection paladin.</>, HolySchmidt),
  change(date(2020, 11, 8), <>Add Overcap analyzer for <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id}/> </>, Hordehobbs),
  change(date(2020, 10, 27), <>Update analyzers for <SpellLink id={SPELLS.RIGHTEOUS_PROTECTOR_TALENT.id}/> and <SpellLink id={SPELLS.SERAPHIM_TALENT.id}/>.</>, Hordehobbs),
  change(date(2020, 10, 26), <>Create analyzers for <SpellLink id={SPELLS.FIRST_AVENGER_TALENT.id} /> and <SpellLink id={SPELLS.MOMENT_OF_GLORY_TALENT.id} />.</>, Hordehobbs),
  change(date(2020, 10, 25), <>Create analyzers for <SpellLink id={SPELLS.REDOUBT_TALENT.id} /> and <SpellLink id={SPELLS.BLESSED_HAMMER_TALENT.id}/>.</>, Hordehobbs),
  change(date(2020, 10, 24), <>Changed <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> tracking from "good casts" to hits mitigated.</>, emallson),
  change(date(2020, 10, 23), <>Aggregate Prot and Ret <SpellLink id={SPELLS.JUDGMENT_CAST.id} /> analyzers into single analyzer.</>, Hordehobbs),
  change(date(2020, 10, 21), 'Add Holy Shield spell blocks analyzer', Hordehobbs),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 17), <>Convert <SpellLink id={SPELLS.GRAND_CRUSADER.id} /> and SpellUsable to TypeScript.</>, Hordehobbs),
  change(date(2020, 10, 17), <>Added preliminary <SpellLink id={SPELLS.WORD_OF_GLORY.id} /> suggestions.</>, emallson),
  change(date(2020, 10, 16), "Add Sanctified Wrath judgement tracker.", Hordehobbs),
  change(date(2020, 10, 14), <>Added suggestion for <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> hits.</>, Hordehobbs),
  change(date(2020, 10, 13), "Convert Consecration analyzer to Typescript.", Hordehobbs),
  change(date(2020, 10, 12), "Initial changes for Shadowlands Prepatch.", emallson),
];
