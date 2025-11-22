import { Enchant } from 'common/ITEMS/Item';

// For effectIds, see https://github.com/simulationcraft/simc/blob/431b448e64a6db85ec9befdf76484e50423bd3ad/engine/dbc/generated/permanent_enchant.inc

const enchants = {
  /* Template */
  // X_R1: {
  //   id: 0,
  //   name: '',
  //   icon: 'inv_misc_enchantedscroll',
  //   effectId: 0,
  //   craftQuality: 1,
  // },
  // X_R2: {
  //   id: 0,
  //   name: '',
  //   icon: 'inv_misc_enchantedscroll',
  //   effectId: 0,
  //   craftQuality: 2,
  // },
  // X_R2: {
  //   id: 0,
  //   name: '',
  //   icon: 'inv_misc_enchantedscroll',
  //   effectId: 0,
  //   craftQuality: 3,
  // },
} satisfies Record<string, Enchant>;

export default enchants;
