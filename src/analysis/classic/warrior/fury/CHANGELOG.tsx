import { change, date } from 'common/changelog';
import { Amryu, Xinito } from 'CONTRIBUTORS';

export default [
  change(
    date(2026, 6, 6),
    'Update the Preparation tab enchant checker to Mists of Pandaria data (no more Head enchant, recognises MoP enchants) and recommend the best-in-slot Fury enchants.',
    Xinito,
  ),
  change(
    date(2026, 6, 6),
    'Show Bladestorm as a situational AOE spell instead of an on-cooldown cooldown, so it no longer reads as a missed cast on single-target fights.',
    Xinito,
  ),
  change(
    date(2026, 6, 6),
    'Refine the Colossus Smash Window analyzer: fix the opportunity counting, gate Raging Blow on its "Raging Blow!" proc, and drop Dragon Roar (magic damage does not benefit from the window).',
    Xinito,
  ),
  change(
    date(2026, 6, 6),
    'Add Colossus Smash Window Strategy analyzer to track burst spell usage within the armor-bypass window.',
    Xinito,
  ),
  change(date(2026, 6, 6), 'Add Colossus Smash to the rotation.', Xinito),
  change(
    date(2026, 6, 6),
    'Migrate abilities to the generated spellbook (fixing talent gating, AOE categories and bogus cast efficiency on rage dumps).',
    Xinito,
  ),
  change(date(2026, 6, 6), 'Add a Guide view for Classic Fury Warrior.', Xinito),
  change(date(2026, 6, 6), 'Update Classic Fury Warrior to MoP 5.5.4 and regenerate the spell list.', Xinito),
  change(date(2023, 9, 30), 'Add Classic Fury Warrior.', Amryu),
];
