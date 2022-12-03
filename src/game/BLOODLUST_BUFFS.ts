import SPELLS from 'common/SPELLS';

const BLOODLUST_BUFFS: {
  [key: number]: number;
} = {
  [SPELLS.BLOODLUST.id]: 0.3,
  [SPELLS.HEROISM.id]: 0.3, // Alliance Bloodlust
  [SPELLS.TIME_WARP.id]: 0.3, // Mage
  [SPELLS.PRIMAL_RAGE_1.id]: 0.3, // Hunter pet BL
  [SPELLS.PRIMAL_RAGE_2.id]: 0.3, // Hunter pet BL
  [SPELLS.FURY_OF_THE_ASPECTS.id]: 0.3, // Evoker
  // TODO: Add Feral Hide Drums
};
export default BLOODLUST_BUFFS;
