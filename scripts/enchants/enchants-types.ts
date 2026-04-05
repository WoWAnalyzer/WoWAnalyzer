import { Enchant } from 'common/ITEMS/Item';

export type EnchantmentInternalEntry = {
  type: string;
  key: string;
  value: Enchant;
};

export type EnchantmentStaticDataEntry = ItemEnchantmentStaticDataEntry;

// https://www.raidbots.com/static/data/live/enchantments.json
export type ItemEnchantmentStaticDataEntry = {
  id: number;
  displayName: string; // "Enchant Ring - Thalassian Vers 2"
  baseDisplayName?: string; // "Enchant Ring - Thalassian Vers"
  spellIcon: string; // can be an empty string
  itemId: number;
  itemName: string; // "Thalassian Versatility"
  itemIcon: string; // "inv_12_profession_enchanting_enchantedvellum_green"
  tokenizedName: string; // "thalassian_versatility_2"
  craftingQuality: Enchant['craftQuality'];
  itemLimitCategory?: ItemLimitCategory;
  expansion?: number; // should be present for all relevant entries
  quality?: number;
  unique?: number;
  spellId: number;
  equipRequirements: EquipRequirements;
  stats?: EnchantmentStat[];
  categoryId?: number;
  categoryName?: string; // "Rings Enchants"
};

/**
 * `enchantments` static data contains more than just item enchants, e.g. gems
 *
 * At the time of implementation, only item enchants contain `spellId` property
 */
export const isItemEnchantment = (
  entry: ItemEnchantmentStaticDataEntry,
): entry is ItemEnchantmentStaticDataEntry => 'spellId' in entry;

// https://www.raidbots.com/static/data/live/temp-enchants.json
export type TempEnchantsStaticDataEntry = {
  value: string; // thalassian_phoenix_oil_1
  shortName: string; // Phoenix Oil (Crit/Haste) 1
  name: string; // Thalassian Phoenix Oil (Quality 1)
  itemId: number; // 243733
  icon: string; // inv_12_profession_enchanting_manaoil_red
  expansion: number;
  craftingQuality: Enchant['craftQuality'];
};

type EnchantmentStat = {
  type: string;
  amount: number;
};

type EquipRequirements = {
  itemClass: number;
  itemSubClassMask: number;
  invTypeMask: number;
};

type ItemLimitCategory = {
  id: number;
  name: string;
  quantity: number;
  flags: number;
};
