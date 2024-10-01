import { change, date } from 'common/changelog';
import { Sref } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import { TALENTS_DRUID } from 'common/TALENTS';

export default [
  change(date(2024, 10, 1), <>Updated cooldown graph / tracking to handle <SpellLink spell={TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT} /></>, Sref),
  change(date(2024, 8, 17), <>Marked updated for 11.0.2 and updated the spec's 'About' page.</>, Sref),
  change(date(2024, 8, 14), <>Updated spells to account for 11.0.2 balance patch.</>, Sref),
  change(date(2024, 7, 27), <>Added support for <SpellLink spell={TALENTS_DRUID.LUNATION_TALENT} /></>, Sref),
  change(date(2024, 7, 23), <>Reworked statistics for <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_BALANCE_TALENT} />, <SpellLink spell={TALENTS_DRUID.TWIN_MOONS_TALENT} />, and <SpellLink spell={TALENTS_DRUID.SUNDERED_FIRMAMENT_TALENT} /> to be more clear.</>, Sref),
  change(date(2024, 7, 23), <>Activating Balance Druid analyzer for The War Within! Hero talent analyzers not yet implemented.</>, Sref),
];
