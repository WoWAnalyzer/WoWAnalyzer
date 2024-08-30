import { change, date } from 'common/changelog';
import { Sref } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';

export default [
  change(date(2024, 8, 17), <>Marked updated for 11.0.2 and updated the spec's 'About' page.</>, Sref),
  change(date(2024, 8, 14), <>Updated spells to account for 11.0.2 balance patch.</>, Sref),
  change(date(2024, 8, 3), <>Added Offensive Cooldowns section to Guide.</>, Sref),
  change(date(2024, 7, 29), <>Added <SpellLink spell={SPELLS.SWIPE_BEAR} /> subsection to Guide.</>, Sref),
  change(date(2024, 7, 14), <>Activating Guardian Druid analyzer for The War Within! Hero talent analyzers not yet implemented.</>, Sref),
];
