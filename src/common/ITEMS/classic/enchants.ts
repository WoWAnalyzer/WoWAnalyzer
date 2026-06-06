import { Enchant } from 'common/ITEMS/Item';

// Curated best-in-slot melee/strength-DPS Mists of Pandaria enchants — one recommended pick per
// slot (Strength inscriptions/armor kits, Dancing Steel, etc.). This is intentionally NOT a
// complete MoP enchant list: it only backs the "recommended enchant" tooltips in the Preparation
// tab. The comprehensive set of enchants accepted when *grading* a slot lives in the classic
// EnchantChecker's MAX_ENCHANT_IDS (parser/classic/modules/items/EnchantChecker).
//
// `id` is the enchanting scroll/armor-kit item id and `effectId` is the `permanentEnchant`
// (SpellItemEnchantment) effect id, both sourced from wowsims/mop (assets/database/db.json).
const enchants = {
  // #region Shoulder
  GREATER_TIGER_FANG_INSCRIPTION: {
    id: 83006,
    name: 'Greater Tiger Fang Inscription',
    icon: 'inv_inscription_runescrolloffortitude_yellow',
    effectId: 4803,
  },
  // #endregion

  // #region Cloak
  ENCHANT_CLOAK_SUPERIOR_CRITICAL_STRIKE: {
    id: 74713,
    name: 'Enchant Cloak - Superior Critical Strike',
    icon: 'inv_misc_enchantedscroll',
    effectId: 4424,
  },
  // #endregion

  // #region Chest
  ENCHANT_CHEST_GLORIOUS_STATS: {
    id: 74708,
    name: 'Enchant Chest - Glorious Stats',
    icon: 'inv_misc_enchantedscroll',
    effectId: 4419,
  },
  // #endregion

  // #region Bracers
  ENCHANT_BRACER_EXCEPTIONAL_STRENGTH: {
    id: 74704,
    name: 'Enchant Bracer - Exceptional Strength',
    icon: 'inv_misc_enchantedscroll',
    effectId: 4415,
  },
  // #endregion

  // #region Gloves
  ENCHANT_GLOVES_SUPER_STRENGTH: {
    id: 74721,
    name: 'Enchant Gloves - Super Strength',
    icon: 'inv_misc_enchantedscroll',
    effectId: 4432,
  },
  // #endregion

  // #region Legs
  ANGERHIDE_LEG_ARMOR: {
    id: 83765,
    name: 'Angerhide Leg Armor',
    icon: 'inv_misc_armorkit_mop_04',
    effectId: 4823,
  },
  // #endregion

  // #region Boots
  ENCHANT_BOOTS_PANDARENS_STEP: {
    id: 74718,
    name: "Enchant Boots - Pandaren's Step",
    icon: 'inv_misc_enchantedscroll',
    effectId: 4429,
  },
  // #endregion

  // #region Weapon
  ENCHANT_WEAPON_DANCING_STEEL: {
    id: 74726,
    name: 'Enchant Weapon - Dancing Steel',
    icon: 'inv_misc_enchantedscroll',
    effectId: 4444,
  },
  // #endregion
} satisfies Record<string, Enchant>;

export default enchants;
