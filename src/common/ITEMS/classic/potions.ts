import Item from 'common/ITEMS/Item';

const items = {
  // id = item id
  POTION_OF_THE_COBRA: {
    // Weak Potion example
    id: 54643,
    name: 'Potion of the Cobra',
    icon: 'inv_alchemy_elixir_03',
  },
  VOLCANIC_POTION: {
    // Strong Potion example
    id: 58091,
    name: 'Volcanic Potion',
    icon: 'inv_potiond_3',
  },
} satisfies Record<string, Item>;

export default items;
