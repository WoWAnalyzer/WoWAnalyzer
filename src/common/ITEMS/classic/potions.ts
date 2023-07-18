import Item from 'common/ITEMS/Item';

const items = {
  // id = item id
  POTION_OF_SPEED: {
    id: 40211,
    name: 'Potion of Speed',
    icon: 'inv_alchemy_elixir_04',
  },
  RUNIC_MANA_POTION: {
    id: 33448,
    name: 'Runic Mana Potion',
    icon: 'inv_alchemy_elixir_02',
  },
} satisfies Record<string, Item>;

export default items;
