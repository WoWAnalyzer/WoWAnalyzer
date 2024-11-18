import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';

//region Spells
/** Butchery / Carve */
//Butchery and Carve can hit up to 5 targets for Frenzied Strikes
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
/** Frenzied Strikes */
export const FRENZIED_STRIKES_CDR = 3000;
/** Grenade Juggler */
export const JUGGLER_CDR = 2000;
/** Covering Fire */
export const COVERING_FIRE_CDR = 2000;
/** Mongoose Bite */
//Mongoose Bite has traveltime, so if used during Aspect of the Eagle it can have up to 700ms travel time
export const MONGOOSE_BITE_MAX_TRAVEL_TIME = 700;
//Mongoose Bite can have a maximum of 5 stacks
export const MONGOOSE_BITE_MAX_STACKS = 5;
/** Tip of the Spear */
//Tip of the Spear damage increase
export const TIP_DAMAGE_INCREASE = 0.15;
//Tip maximum stacks
export const TIP_MAX_STACKS = 3;
/** Bloodseeker */
//Attack speed gain per bleeding enemy from Bloodseeker
export const BLOODSEEKER_ATTACK_SPEED_GAIN = 0.1;
//endregion
/** Explosives Expert */
// Explosives Expert cooldown reduction
export const EXPLOSIVES_EXPERT_CDR = [0, 1, 2];
//endregion

//region Resources
export const LIST_OF_FOCUS_SPENDERS_SV = [
  TALENTS.BUTCHERY_TALENT,
  TALENTS.KILL_SHOT_SURVIVAL_TALENT,
  TALENTS.WILDFIRE_BOMB_TALENT,
  TALENTS.FLANKING_STRIKE_TALENT,
  TALENTS.EXPLOSIVE_SHOT_TALENT,
  ...RAPTOR_MONGOOSE_VARIANTS,
];
//endregion
