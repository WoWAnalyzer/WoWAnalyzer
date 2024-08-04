export default interface Spell {
  id: number;
  name: string;
  icon: string;
  //Death Knights
  runesCost?: number;
  runesCostPerSecond?: number;
  runicPowerCost?: number;
  runicPowerCostPerSecond?: number;
  //Demon Hunter
  furyCost?: number;
  furyCostPerSecond?: number;
  painCost?: number;
  painCostPerSecond?: number;
  //Druid
  lunarPowerCost?: number;
  lunarPowerCostPerSecond?: number;
  //Feral Druid & Rogue
  energyCost?: number;
  energyCostPerSecond?: number;
  comboPointsCost?: number;
  comboPointsCostPerSecond?: number;
  //Hunter
  focusCost?: number;
  focusCostPerSecond?: number;
  //Mage, Paladin, Evoker, Healers & Warlock
  manaCost?: number;
  manaCostPerSecond?: number;
  //Monk
  chiCost?: number;
  chiCostPerSecond?: number;
  //Paladin
  holyPowerCost?: number;
  holyPowerCostPerSecond?: number;
  //Priest
  insanityCost?: number;
  insanityCostPerSecond?: number;
  // Shaman
  maelstromCost?: number;
  maelstromCostPerSecond?: number;
  //Warlock
  soulShardsCost?: number;
  soulShardsCostPerSecond?: number;
  //Warrior
  rageCost?: number;
  rageCostPerSecond?: number;
  //Evoker
  essenceCost?: number;
  essenceCostPerSecond?: number;
  //Classic
  lowRanks?: Array<number>;
  enchantId?: number;
}

/**
 * @deprecated
 */
export interface LegendarySpell extends Spell {
  bonusID?: number;
}

export interface Enchant extends Spell {
  effectId: number;
}

export const isSpell = (x: unknown): x is Spell => {
  const typedObj = x as Spell;
  return (
    ((typedObj !== null && typeof typedObj === 'object') || typeof typedObj === 'function') &&
    typeof typedObj['id'] === 'number' &&
    typeof typedObj['name'] === 'string' &&
    typeof typedObj['icon'] === 'string'
  );
};
