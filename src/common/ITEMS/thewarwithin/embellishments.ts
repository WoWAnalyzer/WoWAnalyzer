import { Enchant } from '../Item';

const embellishments = {
  DARKMOON_SIGIL_ASCENSION: {
    id: 457594,
    name: 'Ascendance',
    icon: 'inv_inscriptions_darkmoondeckevolution_0',
    effectId: 11300,
  },
  WRITHING_ARMOR_BANDING: {
    id: 443902,
    name: 'Writhing Armor Banding',
    icon: 'ability_warlock_everlastingaffliction',
    effectId: 11109,
  },
} satisfies Record<string, Enchant>;

export default embellishments;
