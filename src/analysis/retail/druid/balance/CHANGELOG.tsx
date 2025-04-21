import { change, date } from 'common/changelog';
import { Sref, Vollmer } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import { TALENTS_DRUID } from 'common/TALENTS';

export default [
  change(date(2025, 4, 21), <>Update example log.</>, Vollmer),
  change(date(2025, 3, 4), <>Marked as updated for 11.1.0.</>, Sref),
  change(date(2024, 11, 18), <>Fixed an issue where <SpellLink spell={TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT} /> wouldn't show in cooldowns tab when <SpellLink spell={TALENTS_DRUID.ORBITAL_STRIKE_TALENT} /> talent is chosen.</>, Sref),
  change(date(2024, 10, 26), <>Update underlying talent data for 11.0.5. Fixed cooldown display with <SpellLink spell={TALENTS_DRUID.WHIRLING_STARS_TALENT} />. Added support for <SpellLink spell={TALENTS_DRUID.LUNAR_CALLING_TALENT} /> in Guide text. Fixed an issue where Mushroom cooldown graph would be shown when player takes <SpellLink spell={TALENTS_DRUID.SUNSEEKER_MUSHROOM_TALENT} />. </>, Sref),
  change(date(2024, 10, 1), <>Updated cooldown graph / tracking to handle <SpellLink spell={TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT} /></>, Sref),
  change(date(2024, 8, 17), <>Marked updated for 11.0.2 and updated the spec's 'About' page.</>, Sref),
  change(date(2024, 8, 14), <>Updated spells to account for 11.0.2 balance patch.</>, Sref),
  change(date(2024, 7, 27), <>Added support for <SpellLink spell={TALENTS_DRUID.LUNATION_TALENT} /></>, Sref),
  change(date(2024, 7, 23), <>Reworked statistics for <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_BALANCE_TALENT} />, <SpellLink spell={TALENTS_DRUID.TWIN_MOONS_TALENT} />, and <SpellLink spell={TALENTS_DRUID.SUNDERED_FIRMAMENT_TALENT} /> to be more clear.</>, Sref),
  change(date(2024, 7, 23), <>Activating Balance Druid analyzer for The War Within! Hero talent analyzers not yet implemented.</>, Sref),
];
