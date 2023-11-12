/**
 * NAME: {
 *   id: number,
 *   name: string,
 *   icon: string,
 * },
 */
import Item from 'common/ITEMS/Item';

const items = {
  ELEMENTAL_LARIAT: {
    id: 193001,
    name: 'Elemental Lariat',
    icon: 'inv_10_jewelcrafting_necklace_necklace1_color3',
  },
} satisfies Record<string, Item>;
export default items;
