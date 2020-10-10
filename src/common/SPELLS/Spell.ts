export default interface Spell {
<<<<<<< HEAD
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

=======
  id: number;
  name: string;
  icon: string;
  resourceCost?: number;
  manaCost?: number;
  castTime?: number;
  bonusID?: number; //In the current implementation of the legendary system in Shadowlands - the only identifying feature on legendary is a added bonusID. When that bonusID is attached to the spell object of the Legendary Effect (which is a spell) we can cross reference and use our SpellLink functionality as ItemLink sadly won't work.
};

>>>>>>> 80d8607f8... [Legendaries] Change Legendary spells to be included as optional in the generic Spell type
export interface SpellList<T extends Spell = Spell> {
  [key: string]: T
}
