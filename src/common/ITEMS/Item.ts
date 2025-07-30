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

type Buffs = Buff[];

export interface Trinket extends Item {
  buffs: Buffs;
}

export interface Food extends Item {
  buffId: number;
}

export interface CraftedItem extends Item {
  craftQuality: 1 | 2 | 3 | 4 | 5;
}

export interface Enchant extends Item {
  effectId: number;
  craftQuality?: 1 | 2 | 3 | 4 | 5;
}

export type ItemList<T extends Item = Item> = Record<string, T>;
