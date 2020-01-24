import React from 'react';

import { Sharrq, Juko8 } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2019, 12, 19), <>Converted Fire Mage modules to Typescript.</>,[Sharrq]),
  change(date(2019, 11, 14), <>Added analysis for using <SpellLink id={SPELLS.METEOR_TALENT.id} /> during <SpellLink id={SPELLS.COMBUSTION.id} />. Also adjusted Meteor Efficiency target to account for holding it for Combustion.</>,[Sharrq]),
  change(date(2019, 10, 9), <>Added Statistic Boxes for <SpellLink id={SPELLS.SEARING_TOUCH_TALENT.id} /> and <SpellLink id={SPELLS.KINDLING_TALENT.id} /> and fixed the <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> statistic box.</>,[Sharrq]),
  change(date(2019, 10, 9), <>Combined the statistic boxes for <SpellLink id={SPELLS.HOT_STREAK.id} /> and Hot Streak Pre-Casts.</>,[Sharrq]),
  change(date(2019, 10, 2), <>Fixed a bug in <SpellLink id={SPELLS.METEOR_TALENT.id} /> that was marking a cast as bad if it was cast at the same time as <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /></>,[Sharrq]),
  change(date(2019, 10, 1), 'Updated Statistic Boxes to new format.',[Sharrq]),
  change(date(2019, 9, 30), 'Updated Spec Compatibility to 8.2.5.',[Sharrq]),
  change(date(2019, 9, 25), <>Fixed a bug in <SpellLink id={SPELLS.METEOR_TALENT.id} /> that was incorrectly marking casts as bad if they were cast while empowered by <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} />.</>, Juko8),
  change(date(2019, 9, 19), <>Fixed a bug in <SpellLink id={SPELLS.METEOR_TALENT.id} /> that was looking for the wrong Spell ID for <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} />.</>, [Sharrq]),
  change(date(2019, 9, 3), <>Fixed bug in <SpellLink id={SPELLS.LUCID_DREAMS_MAJOR.id} />.</>, [Sharrq]),
  change(date(2019, 8, 27), <>Update <SpellLink id={SPELLS.BLASTER_MASTER.id} /> explanation graphic to new version.</>, [Sharrq]),
  change(date(2019, 8, 21), <>Add support for Fire Blast cooldown reduction from <SpellLink id={SPELLS.LUCID_DREAMS_MAJOR.id} />.</>, [Sharrq]),
  change(date(2019, 8, 20), <>Minor code style fix</>, [Sharrq]),
  change(date(2019, 8, 20), <>Fixed an issue that caused Boss Health calculations to be incorrect on Lady Ashvane, resulting in incorrect results for several statistics and suggestions.</>, [Sharrq]),
  change(date(2019, 8, 19), <>Removed <SpellLink id={SPELLS.PYROCLASM_TALENT.id} /> during <SpellLink id={SPELLS.COMBUSTION.id} /> suggestions to match Altered Time guide.</>, [Sharrq]),
  change(date(2019, 8, 19), <>Added support for <ItemLink id={ITEMS.HYPERTHREAD_WRISTWRAPS.id} />.</>, [Sharrq]),
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
