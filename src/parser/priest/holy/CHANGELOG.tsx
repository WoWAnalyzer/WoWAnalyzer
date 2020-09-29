import React from 'react';

import { Khadaj, niseko, Yajinni, Zerotorescue, blazyb } from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 5, 1), `Fixed an issue with the stat weights module that caused Versatility to be undervalued.`, niseko),
  change(date(2019, 10, 25), <>Fixing Holy Nova bug.</>, [Khadaj]),
  change(date(2019, 10, 22), <>Adding holy priest stat weights module.</>, [Khadaj]),
  change(date(2019, 10, 20), <>Fixing echo of light crash.</>, [Khadaj]),
  change(date(2019, 8, 12), 'Added essence Lucid Dreams.', [blazyb]),
  change(date(2019, 4, 9), <>Adding Holy Nova card and updating spreadsheet</>, [Khadaj]),
  change(date(2019, 3, 12), <>Fixed an error in the <SpellLink id={SPELLS.PRAYERFUL_LITANY.id} /> analyzer.</>, [Zerotorescue]),
  change(date(2018, 12, 18), <>Adding <SpellLink id={SPELLS.PROMISE_OF_DELIVERANCE.id} /> and <SpellLink id={SPELLS.DEATH_DENIED.id} />.</>, [Khadaj]),
  change(date(2018, 11, 5), 'Adding Renew suggestion.', [Khadaj]),
  change(date(2018, 10, 22), 'Adding mana efficiency tab.', [Khadaj]),
  change(date(2018, 9, 13), 'Adding Holy Priest Azerite traits.', [Khadaj]),
  change(date(2018, 9, 7), 'Creating Holy Priest spreadsheet export.', [Khadaj]),
  change(date(2018, 9, 6), 'Updating base Holy Priest checklist.', [Khadaj]),
  change(date(2018, 7, 28), <>Added suggestion for maintaining <SpellLink id={SPELLS.PERSEVERANCE_TALENT.id} /> and <SpellLink id={SPELLS.POWER_WORD_FORTITUDE.id} /> buffs.</>, [Yajinni]),
  change(date(2018, 7, 28), <>Added Stat box for <SpellLink id={SPELLS.COSMIC_RIPPLE_TALENT.id} />.</>, [Yajinni]),
  change(date(2018, 7, 26), <>Added Stat box for <SpellLink id={SPELLS.TRAIL_OF_LIGHT_TALENT.id} />.</>, [Yajinni]),
  change(date(2018, 7, 5), 'Updated Holy Priest spells for BFA and accounted for Holy Words cooldown reductions.', [niseko]),
];
