import React from 'react';

import { emallson, Hordehobbs, Zeboot } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
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
  change(date(2020, 10, 12), "Initial changes for Shadowlands Prepatch.", [emallson]),
  change(date(2020, 3, 29), <>Added support for <SpellLink id={SPELLS.LUCID_DREAMS.id} /> minor. Note that the major is still unsupported.</>, emallson),
  change(date(2019, 5, 17), <>Fixed an issue with <SpellLink id={SPELLS.JUDGMENT_CAST_PROTECTION.id} /> having its cooldown reset too often when using <SpellLink id={SPELLS.CRUSADERS_JUDGMENT_TALENT.id} />. Special thanks to Woliance for helping me work it out.</>, [emallson]),
  {
    date: new Date('16 February 2019'),
    contributors: [emallson],
    changes: <><SpellLink id={SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id} /> cast delay is now only tracked for self-targeted casts.</>,
  },
  {
    date: new Date('29 December 2018'),
    contributors: [emallson],
    changes: <>Added support for Avenger's Valor to the Good <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> casts check.</>,
  },
  {
    date: new Date('29 December 2018'),
    contributors: [emallson],
    changes: <>Moved <SpellLink id={SPELLS.ARDENT_DEFENDER.id} /> to the damage mitigation checklist item. Removed the "Use your defensive cooldowns" checklist item.</>,
  },
  {
    date: new Date('11 November 2018'),
    contributors: [emallson],
    changes: <>Added <SpellLink id={SPELLS.LIGHT_OF_THE_PROTECTOR.id} /> / <SpellLink id={SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id} /> delay and overheal tracking.</>,
  },
  {
    date: new Date('30 October 2018'),
    contributors: [emallson],
    changes: <>Added <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> cooldown reduction statistic.</>,
  },
  {
    date: new Date('28 October 2018'),
    contributors: [emallson],
    changes: <>Converted <SpellLink id={SPELLS.CONSECRATION_CAST.id} /> from buff uptime to hit tracking.</>,
  },
  {
    date: new Date('10 October 2018'),
    contributors: [emallson],
    changes: <>Added tracking for which <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> casts are effective.</>,
  },
  {
    date: new Date('6 October 2018'),
    contributors: [emallson],
    changes: <>Added support for <SpellLink id={SPELLS.INSPIRING_VANGUARD.id} />, including the ability to exactly detect <SpellLink id={SPELLS.GRAND_CRUSADER.id} /> resets when this trait is taken.</>,
  },
];
