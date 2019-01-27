import GEAR_SLOTS from './GEAR_SLOTS';

// Some Tabards have a higher ilvl than 1 so exclude them from the avg ilvl (not sure about shirts, but including them)
const EXCLUDED_ITEM_SLOTS = [GEAR_SLOTS.SHIRT, GEAR_SLOTS.TABARD];

export default function getAverageItemLevel(gear) {
  const filteredGear = gear.filter((item, slotId) => !EXCLUDED_ITEM_SLOTS.includes(slotId));
  return filteredGear.reduce((total, item) => total + item.itemLevel, 0) / filteredGear.length;
}
