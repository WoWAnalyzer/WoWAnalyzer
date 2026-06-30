import ClassicEnchantChecker, {
  WEAPON_MAX_ENCHANT_IDS,
} from 'parser/classic/modules/items/EnchantChecker';

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
    // Replace parent weapon enchants with DK-specific runeforges. Filter out the regular weapon
    // enchant ids (kept in sync with the base list via the shared WEAPON_MAX_ENCHANT_IDS export)
    // while preserving every other slot's max-enchant ids — DKs must use runeforges, never
    // regular weapon enchants.
    const parentMax = super.MaxEnchantIds.filter((id) => !WEAPON_MAX_ENCHANT_IDS.includes(id));
    return [...parentMax, ...FROST_MAX_RUNEFORGES];
  }
}

export default EnchantChecker;
