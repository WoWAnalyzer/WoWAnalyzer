import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';

//region Spells
/** Takedown Buff */
//Coordinated Assault increases all damage done by 20%
export const TAKEDOWN_DMG_MOD = 0.2;
/** Wildfire Bomb */
//People aren't robots, give them a bit of leeway in terms of when they cast WFB to avoid capping on charges
export const WILDFIRE_BOMB_LEEWAY_BUFFER = 500;
/** Kill Command */
//Kill Command for Survival regenerates 15 focus
export const SV_KILL_COMMAND_FOCUS_GAIN = 15;
//endregion

//region Talents
/** Raptor Strike / Mongoose Bite */
//Raptor Strike during Aspect of the Eagle changes spellIDs.
export const RAPTOR_MONGOOSE_VARIANTS = [TALENTS.RAPTOR_STRIKE_TALENT, SPELLS.RAPTOR_STRIKE_AOTE];
/** Aspect of the Eagle */
//This is the baseline cooldown of Aspect of the Eagle
export const BASELINE_AOTE_CD = 90000;
/** Covering Fire */
export const COVERING_FIRE_CDR = 2000;
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

/** Wildfire Shells */
// CDR per Boomstick tick that hits at least one target
export const WILDFIRE_SHELLS_CDR_PER_TICK = 2000;
// Internal cooldown on the CDR
export const WILDFIRE_SHELLS_TICK_COOLDOWN = 100;
//endregion

/** Lethal Calibration */
// CDR per Wildfire Bomb impact hit (initial explosion damage)
export const LETHAL_CALIBRATION_CDR_PER_HIT = 2000;
// Maximum targets that can grant CDR per Wildfire Bomb cast
export const LETHAL_CALIBRATION_MAX_TARGETS = 5;
//endregion
/** Stalk and Strike */
// Cooldown reduction granted to Wildfire Bomb for Survival
export const STALK_AND_STRIKE_CDR = 10000;
// Maximum wasted CDR threshold before marking as bad cast
export const STALK_AND_STRIKE_WASTE_THRESHOLD = 3000;
// Buffer time to look for Moonlight Chakram cast after Trueshot or Takedown
// And for the damage after Chakram is cast
export const MOONLIGHT_CHAKRAM_BUFFER = 16000;

//region Resources
export const LIST_OF_FOCUS_SPENDERS_SV = [
  TALENTS.WILDFIRE_BOMB_TALENT,
  TALENTS.FLAMEFANG_PITCH_TALENT,
  TALENTS.BOOMSTICK_TALENT,
  ...RAPTOR_MONGOOSE_VARIANTS,
];
//endregion
