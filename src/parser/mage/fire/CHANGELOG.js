import React from 'react';

import { Sharrq } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2019, 8, 16), <>Added support for <ItemLink id={ITEMS.HYPERTHREAD_WRISTWRAPS.id} />.</>, [Sharrq]),
  change(date(2019, 8, 16), <>Modified <SpellLink id={SPELLS.COMBUSTION.id} /> during <SpellLink id={SPELLS.FIRESTARTER_TALENT.id} /> to only check the first cast during Combustion and not every cast.</>, [Sharrq]),
  change(date(2019, 8, 16), <>Fixed a bug that was causing the <SpellLink id={SPELLS.PYROCLASM_TALENT.id} /> checklist item to show up without Pyroclasm talented.</>, [Sharrq]),
  change(date(2019, 8, 6), <>Added statistics and suggestions for <SpellLink id={SPELLS.METEOR_TALENT.id} /></>, [Sharrq]),
  change(date(2019, 8, 6), 'Reworded Hot Streak pre cast suggestion to make it clearer.', [Sharrq]),
  change(date(2019, 8, 6), 'Updated spec compatibility to 8.2.', [Sharrq]),
  change(date(2019, 3, 14), 'Updated spec compatibility to 8.1.5.', [Sharrq]),
  change(date(2019, 3, 2), 'Added spec buffs to the timeline.', [Sharrq]),
  change(date(2018, 12, 16), 'Updated for Patch 8.1.', [Sharrq]),
  change(date(2018, 11, 28), <>Updated <SpellLink id={SPELLS.COMBUSTION.id} /> module to support <SpellLink id={SPELLS.BLASTER_MASTER.id} />.</>, [Sharrq]),
  change(date(2018, 11, 17), <>Updated the <SpellLink id={SPELLS.HEATING_UP.id} /> module to fix some incorrect values and to properly handle <SpellLink id={SPELLS.SEARING_TOUCH_TALENT.id} />.</>, [Sharrq]),
  change(date(2018, 11, 15), <>Added support for <SpellLink id={SPELLS.BLASTER_MASTER.id} />.</>, [Sharrq]),
  change(date(2018, 11, 14), <>Updated the <SpellLink id={SPELLS.HOT_STREAK.id} /> module to fix some incorrect suggestions and make things easier to understand.</>, [Sharrq]),
  change(date(2018, 10, 11), 'Fixed bug that caused Suggestions to crash', [Sharrq]),
  change(date(2018, 9, 14), 'Updated Checklist', [Sharrq]),
  change(date(2018, 6, 28), 'Updated for 8.0 BFA Prepatch.', [Sharrq]),
];
