import { asRestrictedTable } from '../indexById';

export default interface Spell {
  id: number;
  name: string;
  icon: string;
  //Death Knights
  runesCost?: number;
  runicPowerCost?: number;
  //Demon Hunter
  furyCost?: number;
  painCost?: number;
  //Druid
  lunarPowerCost?: number;
  //Feral Druid & Rogue
  energyCost?: number;
  comboPointsCost?: number;
  //Hunter
  focusCost?: number;
  //Mage, Healers & Warlock
  manaCost?: number;
  //Monk
  chiCost?: number;
  //Paladin
  holyPowerCost?: number;
  //Priest
  insanityCost?: number;
  // Shaman
  maelstromCost?: number;
  //Warlock
  soulShardsCost?: number;
  //Warrior
  rageCost?: number;
  //Evoker
  essenceCost?: number;
  //Classic
  lowRanks?: Array<number>;
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

export interface SpellList<T extends Spell = Spell> {
  [key: string | number]: T;
}

export const spellIndexableList = asRestrictedTable<Spell>();
export const enchantIndexableList = asRestrictedTable<Enchant>();

export const isSpell = (x: unknown): x is Spell => {
  const typedObj = x as Spell;
  return (
    ((typedObj !== null && typeof typedObj === 'object') || typeof typedObj === 'function') &&
    typeof typedObj['id'] === 'number' &&
    typeof typedObj['name'] === 'string' &&
    typeof typedObj['icon'] === 'string'
  );
};
