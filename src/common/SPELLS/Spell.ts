export default interface Spell {
  id: number;
  name: string;
  icon: string;
  manaCost?: number;
};

export interface MonkSpell extends Spell {
  manaPercRed?: number;
  buffDur?: number;
  manaRet?: number;
}

export interface DemonHunterSpell extends Spell {
  painCost?: number;
  firstStrikeSpellId?: number;
}

export interface PriestSpell extends Spell {
  atonementDuration?: number;
  coefficient?: number;
}

export interface ShamanSpell extends Spell {
  maelstrom?: number;
  maxMaelstrom?: number;
  coefficient?: number;
  color?: string;
  castTime?: number;
}

export interface HunterSpell extends Spell {
  focusCost?: number;
}

export interface LegendarySpell extends Spell {
  bonusID?: number;
}

export interface SpellList<T extends Spell = Spell> {
  [key: string]: T
}
