import { asIndexableList } from 'common/indexById';

export default interface Item {
  id: number;
  name: string;
  icon: string;
}

export interface Enchant extends Item {
  effectId: number;
}

export interface ItemList<T extends Item = Item> {
  [key: string]: T;
}

export const itemIndexableList = asIndexableList<Item>();
export const enchantIndexableList = asIndexableList<Enchant>();
