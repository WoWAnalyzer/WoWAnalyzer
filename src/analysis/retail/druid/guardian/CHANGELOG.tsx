import { change, date } from 'common/changelog';
import { Sref, Vollmer, Rex } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';

export default [
  change(date(2026, 1, 22), <>Initial Guardian Druid activation for Midnight! Very rough state, some modules inactive. Apex talents not yet implemented.</>, Rex),
  change(date(2025, 4, 21), <>Update example log.</>, Vollmer),
  change(date(2025, 3, 4), <>Updated Frenzied Regeneration cooldown to account for changes to <SpellLink spell={TALENTS_DRUID.REINVIGORATION_TALENT} />. Marked as updated for 11.1.0.</>, Sref),
  change(date(2024, 10, 27), <>Updated patch compatibility to 11.0.5.</>, Sref),
  change(date(2024, 9, 23), <>Fixed an issue where active defensives weren't showing on the Timeline or Death Recap views. Added <SpellLink spell={TALENTS_DRUID.LUNAR_BEAM_TALENT} /> to the defensives list.</>, Sref),
  change(date(2024, 8, 17), <>Marked updated for 11.0.2 and updated the spec's 'About' page.</>, Sref),
  change(date(2024, 8, 14), <>Updated spells to account for 11.0.2 balance patch.</>, Sref),
  change(date(2024, 8, 3), <>Added Offensive Cooldowns section to Guide.</>, Sref),
  change(date(2024, 7, 29), <>Added <SpellLink spell={SPELLS.SWIPE_BEAR} /> subsection to Guide.</>, Sref),
  change(date(2024, 7, 14), <>Activating Guardian Druid analyzer for The War Within! Hero talent analyzers not yet implemented.</>, Sref),
];
