export default interface Spell {
  id: number;
  name: string;
  icon: string;
  //Death Knights
  runesCost?: number
  runicPowerCost?: number;
  //Demon Hunter
  furyCost?: number;
  painCost?: number;
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
  //Warlock
  soulShardsCost?: number;
  //Warrior
  rageCost?: number;
};

export interface LegendarySpell extends Spell {
  bonusID?: number;
}

export interface Enchant extends Spell {
  effectId: number;
}

export interface SpellList<T extends Spell = Spell> {
  [key: string]: T
}
