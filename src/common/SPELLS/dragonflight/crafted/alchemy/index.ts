/**
 * NAME: {
 *   id: number,
 *   name: string,
 *   icon: string,
 * },
 */
import Spell from 'common/SPELLS/Spell';

const items = {
  ALACRITOUS_ALCHEMIST_STONE: {
    id: 396047,
    name: 'Alacritous Alchemist Stone',
    icon: 'inv_10_alchemy_alchemystone_color1',
  },
} satisfies Record<string, Spell>;

export default items;
