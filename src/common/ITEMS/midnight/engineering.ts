import { CraftedItem } from 'common/ITEMS/Item';
/**
 * @description This file contains items that can be crafted by the engineering profession and have an intended use during combat.
 */
const Engineering = {
  EMERGENCY_SOUL_LINK_R1: {
    //battle resurrection item
    id: 248486,
    name: 'Emergency Soul Link',
    icon: 'ability_warlock_soullink',
    craftQuality: 1, //baseCastTimeR1 = 6;
  },
  EMERGENCY_SOUL_LINK_R2: {
    //battle resurrection item
    id: 269586,
    name: 'Emergency Soul Link',
    icon: 'ability_warlock_soullink',
    craftQuality: 2, //baseCastTimeR2 = 3;
  },
} satisfies Record<string, CraftedItem>;

export default Engineering;
