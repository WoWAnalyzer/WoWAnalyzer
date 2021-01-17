import SPELLS from 'common/SPELLS';

//region Spells
/** Butchery / Carve */
//Butchery and Carve can hit up to 5 people
export const BUTCHERY_CARVE_MAX_TARGETS_HIT = 5;
/** Coordinated Assault */
//Coordinated Assault increases all damage done by 20%
export const COORDINATED_ASSAULT_DMG_MOD = 0.2;
//Coordinated Assault lasts 20 seconds by default
export const COORDINATED_ASSAULT_BASELINE_DURATION = 20000;
/** Wildfire Bomb */
//People aren't robots, give them a bit of leeway in terms of when they cast WFB to avoid capping on charges
export const WILDFIRE_BOMB_LEEWAY_BUFFER = 500;
//Different types of Bombs
export const SURVIVAL_BOMB_TYPES = [
  SPELLS.WILDFIRE_BOMB.id,
  SPELLS.VOLATILE_BOMB_WFI.id,
  SPELLS.PHEROMONE_BOMB_WFI.id,
  SPELLS.SHRAPNEL_BOMB_WFI.id,
];
/** Kill Command */
//Kill Command for Survival regenerates 15 focus
export const SV_KILL_COMMAND_FOCUS_GAIN = 15;
/** Serpent Sting */
//Serpent Sting costs 20 focus
export const SV_SERPENT_STING_COST = 20;
//Serpent Sting for SV pandemics at 30%
export const SERPENT_STING_SV_PANDEMIC = 0.3;
//The baseduration of Serpent Sting before any haste reduction
export const SERPENT_STING_SV_BASE_DURATION = 12000;
/** Raptor Strike / Mongoose Bite */
//Raptor Strike turns into Mongoose Bite when talented into it, and during Aspect of the Eagle they change spellIDs.
export const RAPTOR_MONGOOSE_VARIANTS = [
  SPELLS.RAPTOR_STRIKE,
  SPELLS.RAPTOR_STRIKE_AOTE,
  SPELLS.MONGOOSE_BITE_TALENT,
  SPELLS.MONGOOSE_BITE_TALENT_AOTE,
];
/** Aspect of the Eagle */
//This is the baseline cooldown of Aspect of the Eagle
export const BASELINE_AOTE_CD = 90000;
//endregion

//region Talents
/** Vipers Venom */
//Serpent Sting costs 0 when Vipers Venom is active
export const VIPERS_VENOM_COST_MULTIPLIER = 0;
//The increased damage of the initial hit of Serpent Sting from Viper's Venom
export const VIPERS_VENOM_DAMAGE_MODIFIER = 2.5;
/** Bird of Prey */
//Bird of Prey extends Coordinated Assault by 1.5 seconds per trigger
export const BOP_CA_EXTENSION_PER_CAST = 1500;
/** Chakrams */
//Chakrams has a bunch of different spellIDs for damage
export const SURVIVAL_CHAKRAM_TYPES = [
  SPELLS.CHAKRAMS_TO_MAINTARGET,
  SPELLS.CHAKRAMS_BACK_FROM_MAINTARGET,
  SPELLS.CHAKRAMS_NOT_MAINTARGET,
];
/** Flanking Strike */
//Flanking Strikes regenerates 30 focus
export const FLANKING_STRIKE_FOCUS_GAIN = 30;
/** Mongoose Bite */
//Mongoose Bite has traveltime, so if used during Aspect of the Eagle it can have up to 700ms travel time
export const MONGOOSE_BITE_MAX_TRAVEL_TIME = 700;
//Mongoose Bite can have a maximum of 5 stacks
export const MONGOOSE_BITE_MAX_STACKS = 5;
/** Guerilla Tactics */
//The initial hit modifier for Guerrilla Tactics talent
export const GUERRILLA_TACTICS_INIT_HIT_MODIFIER = 1;
//Spells affected by Guerrilla Tactics talent
export const AFFECTED_BY_GUERRILLA_TACTICS = [
  SPELLS.WILDFIRE_BOMB_IMPACT,
  SPELLS.VOLATILE_BOMB_WFI_IMPACT,
  SPELLS.PHEROMONE_BOMB_WFI_IMPACT,
  SPELLS.SHRAPNEL_BOMB_WFI_IMPACT,
];
/** Tip of the Spear */
//Tip of the Spear damage increase
export const TIP_DAMAGE_INCREASE = 0.25;
//Tip maximum stacks
export const TIP_MAX_STACKS = 3;
/** Alpha Predator */
//The damage increase from Alpha Predator
export const ALPHA_DAMAGE_KC_MODIFIER = 0.3;
/** Bloodseeker */
//Attack speed gain per bleeding enemy from Bloodseeker
export const BLOODSEEKER_ATTACK_SPEED_GAIN = 0.1;
/** Hydra's Bite */
//Hydra's Bite DOT damage increase
export const HYDRAS_BITE_DOT_MODIFIER = 0.2;
//endregion

//region Resources
export const LIST_OF_FOCUS_SPENDERS_SV = [
  SPELLS.BUTCHERY_TALENT,
  SPELLS.CARVE,
  SPELLS.WING_CLIP,
  SPELLS.CHAKRAMS_TALENT,
  SPELLS.SERPENT_STING_SV,
  ...RAPTOR_MONGOOSE_VARIANTS,
];
export const BASE_FOCUS_REGEN_SV = 5;
export const BASE_MAX_FOCUS_SV = 100;
//endregion

//region Conduits
/** Deadly Tandem */
//Deadly Tandem increases the duration of Coordinated Assault by a flat amount
export const DEADLY_TANDEM_CA_DURATION_INCREASE = [0, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000];
/** Flame Infusion */
//Flame infusion increases the damage of the next Wildfire Bomb (or WFI equivalent) by x%
export const FLAME_INFUSION_WFB_DAMAGE_INCREASE = [0, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.2, 0.21, 0.22, 0.23, 0.24, 0.25];
//Flame Infusion can stack twice
export const FLAME_INFUSION_MAX_STACKS = 2;
/** Stinging Strike */
//Stinging Strike increases the damage of Mongoose Bite / Raptor Strike by a flat amount
export const STINGING_STRIKE_RS_MB_DMG_INCREASE = [0, 0.14, 0.16, 0.17, 0.19, 0.20, 0.22, 0.23, 0.25, 0.26, 0.28, 0.29, 0.31, 0.32, 0.34, 0.35];
/** Strength of the Pack */
//Strength of the Pack increases all damage done by a % for its duration
export const STRENGTH_OF_THE_PACK_DAMAGE_MODIFIER = [0, 0.03, 0.04, 0.04, 0.05, 0.05, 0.06, 0.06, 0.07, 0.07, 0.08, 0.08, 0.09, 0.09, 0.1, 0.1];
//endregion

//region Legendaries
/** Rylakstalker's Confounding Strikes */
//Rylakstalker's Confounding Strikes gives Mongoose Bite and Raptor Strike a 15% chance to reset the cooldown of Wildfire Bomb
export const RYLAKSTALKERS_CONFOUNDING_STRIKES_RESET_CHANCE = 0.15;
/** Latent Poison Injectors */
//Latent Poison Injectors stacks up to 10 times
export const LATENT_POISON_INJECOTRS_MAX_STACKS = 10;
/** Butcher's Bone Fragments */
//Butcher's Bone Fragments stacks up to 6 times
export const BUTCHERS_BONE_FRAGMENTS_MAX_STACK = 6;
//Butcher's Bone Fragments increases carve/butchery damage by 20% per stack
export const BUTCHERS_BONE_FRAGMENTS_DMG_AMP = 0.2;
//
//endregion
