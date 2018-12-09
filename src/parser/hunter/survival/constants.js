import SPELLS from 'common/SPELLS';

//Serpent Sting for SV pandemics at 30%
export const SERPENT_STING_SV_PANDEMIC = 0.3;
//The baseduration of Serpent Sting before any haste reduction
export const SERPENT_STING_SV_BASE_DURATION = 12000;
//Wildfire Infusion cast IDS
export const WILDFIRE_INFUSION_CAST = [
  SPELLS.SHRAPNEL_BOMB_WFI.id,
  SPELLS.PHEROMONE_BOMB_WFI.id,
  SPELLS.VOLATILE_BOMB_WFI.id,
];
//Wildfire Infusion impact damage IDs
export const WILDFIRE_INFUSION_IMPACT = [
  SPELLS.SHRAPNEL_BOMB_WFI_IMPACT.id,
  SPELLS.PHEROMONE_BOMB_WFI_IMPACT.id,
  SPELLS.VOLATILE_BOMB_WFI_IMPACT.id,
];
//Wildfire Infusion dot IDs
export const WILDFIRE_INFUSION_DOTS = [
  SPELLS.SHRAPNEL_BOMB_WFI_DOT.id,
  SPELLS.VOLATILE_BOMB_WFI_DOT.id,
  SPELLS.PHEROMONE_BOMB_WFI_DOT.id,
];
