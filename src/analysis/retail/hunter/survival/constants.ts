import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';

//region Spells
/** Butchery / Carve */
//Butchery and Carve can hit up to 5 people
export const BUTCHERY_CARVE_MAX_TARGETS_HIT = 5;
/** Coordinated Assault */
//Coordinated Assault increases all damage done by 20%
export const COORDINATED_ASSAULT_DMG_MOD = 0.2;
/** Wildfire Bomb */
//People aren't robots, give them a bit of leeway in terms of when they cast WFB to avoid capping on charges
export const WILDFIRE_BOMB_LEEWAY_BUFFER = 500;
/** Kill Command */
//Kill Command for Survival regenerates 15 focus
export const SV_KILL_COMMAND_FOCUS_GAIN = 15;
/** Serpent Sting */
//Serpent Sting costs 20 focus
export const SV_SERPENT_STING_COST = 20;
//The baseduration of Serpent Sting before any haste reduction
export const SERPENT_STING_SURVIVAL_BASE_DURATION = 12000;
//endregion

//region Talents
/** Raptor Strike / Mongoose Bite */
//Raptor Strike turns into Mongoose Bite when talented into it, and during Aspect of the Eagle they change spellIDs.
export const RAPTOR_MONGOOSE_VARIANTS = [
  TALENTS.RAPTOR_STRIKE_TALENT,
  SPELLS.RAPTOR_STRIKE_AOTE,
  TALENTS.MONGOOSE_BITE_TALENT,
  SPELLS.MONGOOSE_BITE_TALENT_AOTE,
];
/** Aspect of the Eagle */
//This is the baseline cooldown of Aspect of the Eagle
export const BASELINE_AOTE_CD = 90000;
/** Bird of Prey */
//Bird of Prey extends Coordinated Assault by 1.5 seconds per trigger
export const BOP_CA_EXTENSION_PER_CAST = 1500;
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
export const GUERRILLA_TACTICS_INIT_HIT_MODIFIER = 0.5;
//Spells affected by Guerrilla Tactics talent
export const AFFECTED_BY_GUERRILLA_TACTICS = [SPELLS.WILDFIRE_BOMB_IMPACT];
/** Tip of the Spear */
//Tip of the Spear damage increase
export const TIP_DAMAGE_INCREASE = 0.15;
//Tip maximum stacks
export const TIP_MAX_STACKS = 3;
/** Alpha Predator */
//The damage increase from Alpha Predator
export const ALPHA_DAMAGE_KC_MODIFIER = 0.15;
/** Bloodseeker */
//Attack speed gain per bleeding enemy from Bloodseeker
export const BLOODSEEKER_ATTACK_SPEED_GAIN = 0.1;
/** Hydra's Bite */
//Hydra's Bite DOT damage increase
export const HYDRAS_BITE_DOT_MODIFIER = 0.2;
//endregion
/** Explosives Expert */
// Explosives Expert cooldown reduction
export const EXPLOSIVES_EXPERT_CDR = [0, 1, 2];
/** Ruthless Marauder */
// Ruthless Marauder cooldown reduction
export const RUTHLESS_MARAUDER_CDR = [0, 0.5, 1];
export const RUTHLESS_MARAUDER_CDR_COOLDOWN_MS = 100;
//endregion
// /** Ruthless Marauder */

//region Resources
export const LIST_OF_FOCUS_SPENDERS_SV = [
  TALENTS.BUTCHERY_TALENT,
  TALENTS.KILL_SHOT_SURVIVAL_TALENT,
  TALENTS.WILDFIRE_BOMB_TALENT,
  ...RAPTOR_MONGOOSE_VARIANTS,
];
//endregion
