export default interface Spell {
    id: number;
    name: string;
    icon: string;
    manaCost?: number;
};

export interface HunterSpell extends Spell {
  focusCost?: number;
}

export interface LegendarySpell extends Spell {
  bonusID?: number;
}

export interface SpellList<T extends Spell = Spell> {
  [key: string]: T
}
