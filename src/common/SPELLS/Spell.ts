export default interface Spell {
  id: number;
  name: string;
  icon: string;
  resourceCost?: number;
  bonusID?: number; //In the current implementation of the legendary system in Shadowlands - the only identifying feature on legendary is a added bonusID. When that bonusID is attached to the spell object of the Legendary Effect (which is a spell) we can cross reference and use our SpellLink functionality as ItemLink sadly won't work.
};

export interface SpellList<T extends Spell = Spell> {
  [key: string]: T
}
