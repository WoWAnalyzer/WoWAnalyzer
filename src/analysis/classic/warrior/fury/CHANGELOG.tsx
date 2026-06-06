import { change, date } from 'common/changelog';
import { Amryu, Xinito } from 'CONTRIBUTORS';

export default [
  change(
    date(2026, 6, 6),
    'Add Colossus Smash Window Strategy analyzer to track burst spell usage within the armor-bypass window.',
    Xinito,
  ),
  change(
    date(2026, 6, 6),
    'Add Colossus Smash to the rotation and add a Colossus Smash debuff uptime statistic.',
    Xinito,
  ),
  change(
    date(2026, 6, 6),
    'Migrate abilities to the generated spellbook (fixing talent gating, AOE categories and bogus cast efficiency on rage dumps).',
    Xinito,
  ),
  change(date(2026, 6, 6), 'Add a Guide view for Classic Fury Warrior.', Xinito),
  change(date(2026, 6, 6), 'Update Classic Fury Warrior to MoP 5.5.4 and regenerate the spell list.', Xinito),
  change(date(2023, 9, 30), 'Add Classic Fury Warrior.', Amryu),
];
