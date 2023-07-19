/**
 * NAME: {
 *   id: number,
 *   name: string,
 *   icon: string,
 * },
 */
import Item from 'common/ITEMS/Item';

const items = {
  VANTUS_RUNE_VAULT: {
    id: 198491,
    name: 'Vantus Rune',
    icon: 'inv_10_inscription_vantusrune_color4',
  },
} satisfies Record<string, Item>;
export default items;
