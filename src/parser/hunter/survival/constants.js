import SPELLS from 'common/SPELLS/hunter';

//The initial hit modifier for Guerrilla Tactics talent
export const GUERRILLA_TACTICS_INIT_HIT_MODIFIER = 1;
//Spells affected by Guerrilla Tactics talent
export const AFFECTED_BY_GUERRILLA_TACTICS = [
  SPELLS.WILDFIRE_BOMB_IMPACT.id,
  SPELLS.VOLATILE_BOMB_WFI_IMPACT.id,
  SPELLS.PHEROMONE_BOMB_WFI_IMPACT.id,
  SPELLS.SHRAPNEL_BOMB_WFI_IMPACT.id,
];
//Serpent Sting for SV pandemics at 30%
export const SERPENT_STING_SV_PANDEMIC = 0.3;
//The baseduration of Serpent Sting before any haste reduction
export const SERPENT_STING_SV_BASE_DURATION = 12000;
//The damage increase from Alpha Predator
export const ALPHA_DAMAGE_KC_MODIFIER = 0.3;
//Attack speed gain per bleeding enemy from Bloodseeker
export const BLOODSEEKER_ATTACK_SPEED_GAIN = 0.1;
