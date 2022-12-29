import ITEMS from 'common/ITEMS/classic';

const ITEM_BUFFS: {
  [key: number]: {
    haste_rating?: number;
    spell_power?: number;
  };
} = {
  [ITEMS.DYING_CURSE_BUFF.id]: {
    spell_power: 765,
  },
  [ITEMS.EMBRACE_SPIDER_BUFF.id]: {
    haste_rating: 505,
  },
  [ITEMS.ILLUSTRATION_DRAGON_SOUL_BUFF.id]: {
    spell_power: 20,
  },
  [ITEMS.SUNDIAL_BUFF.id]: {
    spell_power: 505,
  },
};
export default ITEM_BUFFS;
