import Item from 'common/ITEMS/Item';

const items = {
  MASTER_MANA_POTION: {
    id: 76098,
    name: 'Master Mana Potion',
    icon: 'trade_alchemy_potiona5',
  },
  VIRMENS_BITE: {
    id: 76089,
    name: "Virmen's Bite",
    icon: 'trade_alchemy_potiond6',
  },
} satisfies Record<string, Item>;

export default items;
