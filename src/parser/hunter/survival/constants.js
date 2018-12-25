import SPELLS from 'common/SPELLS';

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
//Hydra's Bite DOT damage increase
export const HYDRAS_BITE_DOT_MODIFIER = 0.1;
//Tip of the Spear damage increase
export const TIP_DAMAGE_INCREASE = 0.2;
//Tip maximum stacks
export const TIP_MAX_STACKS = 3;
//Raptor Strike turns into Mongoose Bite when talented into it, and during Aspect of the Eagle they change spellIDs.
export const RAPTOR_MONGOOSE_VARIANTS = [
  SPELLS.RAPTOR_STRIKE.id,
  SPELLS.RAPTOR_STRIKE_AOTE.id,
  SPELLS.MONGOOSE_BITE_TALENT.id,
  SPELLS.MONGOOSE_BITE_TALENT_AOTE.id,
];
//The increased damage of the initial hit of Serpent Sting from Viper's Venom
export const VIPERS_VENOM_DAMAGE_MODIFIER = 2.5;
