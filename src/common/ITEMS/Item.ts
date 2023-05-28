import { asRestrictedTable } from 'common/indexById';

export default interface Item {
  id: number;
  name: string;
  icon: string;
  buffId?: number;
  buffName?: string;
  spellId?: number;
}

export interface Enchant extends Item {
  effectId: number;
}

export interface ItemList<T extends Item = Item> {
  [key: string]: T;
}

export const itemIndexableList = asRestrictedTable<Item>();
export const enchantIndexableList = asRestrictedTable<Enchant>();
