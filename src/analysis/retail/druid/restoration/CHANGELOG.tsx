import { change, date } from 'common/changelog';
import { Sref } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';

export default [
  change(date(2024, 8, 23), <>Cleaner display of <SpellLink spell={SPELLS.WILD_GROWTH}/>, <SpellLink spell={SPELLS.REGROWTH}/>, <SpellLink spell={SPELLS.SWIFTMEND}/>, and <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT}/> sections in Guide. Added <SpellLink spell={SPELLS.SWIFTMEND}/> cast efficiency tracking. Tweaked Guide text. </>, Sref),
  change(date(2024, 8, 17), <>Marked updated for 11.0.2 and updated the spec's 'About' page.</>, Sref),
  change(date(2024, 8, 14), <>Updated spells to account for 11.0.2 balance patch.</>, Sref),
  change(date(2024, 7, 22), <>More data updates to handle new TWW spell IDs. </>, Sref),
  change(date(2024, 7, 14), <>Activating Resto Druid analyzer for The War Within! Hero talent analyzers not yet implemented.</>, Sref),
];
