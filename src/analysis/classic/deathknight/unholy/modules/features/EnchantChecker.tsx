import ClassicEnchantChecker from 'parser/classic/modules/items/EnchantChecker';

// Runeforges that are correct for Unholy DK (2H: Fallen Crusader only)
const UNHOLY_MAX_RUNEFORGES = [
  3368, // Rune of the Fallen Crusader — 2H weapon
];

/**
 * Unholy DK weapon enchant checker.
 *
 * Correct setup: Rune of the Fallen Crusader on the 2H weapon.
 * Any other runeforge (e.g. Razorice) grades as weak.
 * Regular weapon enchants are not valid for Death Knights.
 */
class EnchantChecker extends ClassicEnchantChecker {
  get MaxEnchantIds(): number[] {
    const parentMax = super.MaxEnchantIds.filter(
      (id) => ![4441, 4442, 4443, 4444, 4445, 4446, 4434, 5035, 5124, 5125, 8550].includes(id),
    );
    return [...parentMax, ...UNHOLY_MAX_RUNEFORGES];
  }
}

export default EnchantChecker;
