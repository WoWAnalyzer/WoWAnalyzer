import ClassicEnchantChecker, {
  WEAPON_MAX_ENCHANT_IDS,
} from 'parser/classic/modules/items/EnchantChecker';

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
    // Replace parent weapon enchants with DK-specific runeforges. Filter out the regular weapon
    // enchant ids (kept in sync with the base list via the shared WEAPON_MAX_ENCHANT_IDS export)
    // while preserving every other slot's max-enchant ids — DKs must use runeforges, never
    // regular weapon enchants.
    const parentMax = super.MaxEnchantIds.filter((id) => !WEAPON_MAX_ENCHANT_IDS.includes(id));
    return [...parentMax, ...UNHOLY_MAX_RUNEFORGES];
  }
}

export default EnchantChecker;
