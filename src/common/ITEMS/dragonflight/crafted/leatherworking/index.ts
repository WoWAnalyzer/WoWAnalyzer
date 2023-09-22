/**
 * NAME: {
 *   id: number,
 *   name: string,
 *   icon: string,
 * },
 */
import Item from 'common/ITEMS/Item';

const items = {
  FERAL_HIDE_DRUMS: {
    id: 193470,
    name: 'Feral Hide Drums',
    icon: 'inv_10_skinning_consumable_leatherdrums_color1',
  },
} satisfies Record<string, Item>;
export default items;
