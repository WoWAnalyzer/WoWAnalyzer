import { Nevdok, nullDozzer } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2025, 2, 25), 'Update rotation recommendations for 11.1', Nevdok),
  change(date(2025, 1, 7), 'Add inefficient cast alerts to timeline', Nevdok),
  change(date(2024, 12, 17), 'Update years-old Fury theorycrafting and APL logic', Nevdok),
  change(date(2024, 10, 13), 'Many improvements to cooldown and haste tracking.', nullDozzer),
  change(date(2024, 9, 18), 'Fix various rage bugs! Add some missing spells to spellbook.', nullDozzer),
  change(date(2024, 9, 7), 'Greatly improved tracking of rage generation and sources of rage. Visualized by showing a graph of Rage in the Rage usage tab.', nullDozzer),
  change(date(2024, 8, 26), 'Prepare Fury for War Within. Update talents, spells and cooldowns.', nullDozzer),
];
