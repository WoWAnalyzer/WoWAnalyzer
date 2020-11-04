import SPELLS from 'common/SPELLS/index';

const BLOODLUST_BUFFS: {
  [key: number]: number;
} = {
  [SPELLS.BLOODLUST.id]: 0.3,
  [SPELLS.HEROISM.id]: 0.3, // Alliance Bloodlust
  [SPELLS.TIME_WARP.id]: 0.3, // Mage
  [SPELLS.PRIMAL_RAGE_1.id]: 0.3, // Hunter pet BL
  [SPELLS.PRIMAL_RAGE_2.id]: 0.3, // Hunter pet BL
  [SPELLS.DRUMS_OF_FURY.id]: 0.25, // Legion Leatherworking crafted
  [SPELLS.DRUMS_OF_THE_MOUNTAIN.id]: 0.25, // Legion Leatherworking crafted
  [SPELLS.DRUMS_OF_RAGE.id]: 0.25, // Legion Leatherworking crafted
};
export default BLOODLUST_BUFFS;
