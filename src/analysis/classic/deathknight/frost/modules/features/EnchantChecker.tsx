import ClassicEnchantChecker from 'parser/classic/modules/items/EnchantChecker';

// Runeforges that are correct for Frost DK (MH: Fallen Crusader, OH: Razorice)
const FROST_MAX_RUNEFORGES = [
  3368, // Rune of the Fallen Crusader — MH
  3370, // Rune of Razorice            — OH
];

/**
 * Frost DK weapon enchant checker.
 *
 * Correct setup: Rune of the Fallen Crusader on main-hand,
 * Rune of Razorice on off-hand. Any other runeforge grades as weak.
 * Regular weapon enchants are not valid for Death Knights.
 */
class EnchantChecker extends ClassicEnchantChecker {
  get MaxEnchantIds(): number[] {
    // Replace parent weapon enchants with DK-specific runeforges.
    // Filter out the regular weapon enchant IDs (4441–4446, 4434, 5035, 5124, 5125, 8550)
    // that are in the parent list — DKs must use runeforges, never regular enchants.
    const parentMax = super.MaxEnchantIds.filter(
      (id) => ![4441, 4442, 4443, 4444, 4445, 4446, 4434, 5035, 5124, 5125, 8550].includes(id),
    );
    return [...parentMax, ...FROST_MAX_RUNEFORGES];
  }
}

export default EnchantChecker;
