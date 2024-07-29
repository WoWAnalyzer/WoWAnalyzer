import { change, date } from 'common/changelog';
import { Sref } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';

export default [
  change(date(2024, 7, 29), <>Added <SpellLink spell={SPELLS.SWIPE_BEAR} /> subsection to Guide.</>, Sref),
  change(date(2024, 7, 14), <>Activating Guardian Druid analyzer for The War Within! Hero talent analyzers not yet implemented.</>, Sref),
];
