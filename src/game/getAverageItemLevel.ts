import { Item } from 'parser/core/Events';

import GEAR_SLOTS from './GEAR_SLOTS';

// Some Tabards have a higher ilvl than 1 so exclude them from the avg ilvl (not sure about shirts, but including them)
const EXCLUDED_ITEM_SLOTS = [GEAR_SLOTS.SHIRT, GEAR_SLOTS.TABARD];

export default function getAverageItemLevel(gear: Item[]) {
  const filteredGear = gear.filter((item: Item, slotId: number) => !EXCLUDED_ITEM_SLOTS.includes(slotId) && item.id !== 0);
  return filteredGear.reduce((total: number, item: Item) => total + item.itemLevel, 0) / filteredGear.length;
}
