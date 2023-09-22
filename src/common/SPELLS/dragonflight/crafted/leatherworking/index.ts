/**
 * NAME: {
 *   id: number,
 *   name: string,
 *   icon: string,
 * },
 */
import Spell from 'common/SPELLS/Spell';

const items = {
  FERAL_HIDE_DRUMS: {
    id: 381301,
    name: 'Feral Hide Drums',
    icon: 'inv_10_skinning_consumable_leatherdrums_color1',
  },
} satisfies Record<string, Spell>;

export default items;
