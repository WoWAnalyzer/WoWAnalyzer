export default interface Item {
  id: number;
  name: string;
  icon: string;
}

interface Buff {
  id: number;
  name: string;
  spellId?: number;
}

type Buffs = Array<Buff>

export interface Trinket extends Item {
  buffs: Buffs;
}

export interface Enchant extends Item {
  effectId: number;
}

export interface ItemList<T extends Item = Item> {
  [key: string]: T;
}
