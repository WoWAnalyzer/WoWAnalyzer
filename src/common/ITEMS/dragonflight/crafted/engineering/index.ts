/**
 * NAME: {
 *   id: number,
 *   name: string,
 *   icon: string,
 * },
 */
import Item from 'common/ITEMS/Item';

const items = {
  HEALING_DART_CAST: {
    id: 385350,
    name: 'Healing Dart',
    icon: 'inv_gizmo_runichealthinjector',
  },
} satisfies Record<string, Item>;
export default items;
