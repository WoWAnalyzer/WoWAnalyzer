/**
 * Represents an Events Item from the Parser with various attributes and optional properties.
 *
 * @property id - The unique identifier for the item.
 * @property quality - The quality level of the item
 * @property icon - The icon representing the item.
 * @property itemLevel - The item level, indicating its power or strength.
 * @property bonusIDs - Optional bonus IDs associated with the item, which can be a single number or an array of numbers.
 * @property effectID - Optional effect ID associated with the item.
 * @property permanentEnchant - Optional permanent enchantment applied to the item.
 * @property temporaryEnchant - Optional temporary enchantment applied to the item.
 * @property onUseEnchant - Optional enchantment providing an activatable ability, typically seen in Cataclysm Engineering "enchants".
 * @property gems - Optional array of gems socketed into the item.
 * @property setID - Optional set ID indicating the item belongs to a specific set.
 * @property setItemIDs - Optional array of item IDs that belong to the same set as this item, added during gear parsing for tooltip purposes.
 * @remarks Is reexported from the core Events module.
 */
export interface Item {
  id: number;
  quality: number;
  icon: string;
  itemLevel: number;
  bonusIDs?: number | number[];
  effectID?: number;
  permanentEnchant?: number;
  temporaryEnchant?: number;
  /**
   * An enchant that provides an activatable ability.
   *
   * Only seen it used on Cata Engineering "enchants".
   */
  onUseEnchant?: number;
  gems?: Gem[];
  setID?: number;

  /**
   * Added while parsing gear of the combatant if item is part of a set.
   * Contains all equiped items ids that have the same @setID
   * Used for wowhead tooltip.
   */
  setItemIDs?: number[];
}

/**
 * Represents a gem that can be socketed into an item. *
 * If you are looking for the gem item itself, use the `Item` interface instead.
 *
 * @property id - The unique identifier for the gem.
 * @property itemLevel - The item level of the gem, indicating its power or strength.
 * @property icon - The icon representing the gem.
 * @remarks Is reexported from the core Events module.
 */
export interface Gem {
  id: number;
  itemLevel: number;
  icon: string;
}
