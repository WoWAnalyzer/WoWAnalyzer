import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
//region Spells
/** Rapid Fire */
// Rapid Fire generates 1 focus per hit
export const RAPID_FIRE_FOCUS_PER_TICK = 1;
/** Aimed Shot */
// Aimed Shot has a baseline cast time of 2.5s (longer in Midnight due to Streamline removal)
export const AIMED_SHOT_BASELINE_CAST_TIME = 2500;
/** Trueshot */
// Trueshot makes Aimed Shot recharge 225% faster
export const TRUESHOT_AIMED_SHOT_RECHARGE_INCREASE = 2.25;
// Trueshot makes Rapid Fire recharge 240% faster
export const TRUESHOT_RAPID_FIRE_RECHARGE_INCREASE = 2.4;
// Trueshot increases the cast rate of Aimed Shot by 50%
export const TRUESHOT_AIMED_SHOT_CAST_TIME_SPEED_UP = 0.5;
// Trueshot increases focus regen by 50%
export const TRUESHOT_FOCUS_INCREASE = 0.5;
/** Precise Shots */
// Precise Shots procs per Aimed Shot (baseline 1, Windrunner/talents may increase)
export const PRECISE_SHOTS_ASSUMED_PROCS = 1;
// Precise Shots increase damage of Arcane Shot or Multi-Shot by 100%
export const PRECISE_SHOTS_MODIFIER = 1;
// Travel time buffer for Arcane Shot to consume Precise Shots
export const ARCANE_SHOT_MAX_TRAVEL_TIME = 500;
/** Steady Shot */
// Steady Shot regenerates 10 focus baseline on cast
export const STEADY_SHOT_FOCUS_REGEN = 10;
/** Bulletstorm */
// Bulletstorm max stacks (each Rapid Fire shot adds 1 stack)
export const BULLETSTORM_MAX_STACKS = 20;
// Each Bulletstorm stack increases next Aimed Shot damage by 5%
export const BULLETSTORM_DAMAGE_PER_STACK = 0.05;
//endregion
//region Talents
/** Surging Shots */
// Surging Shots increases Rapid Fire damage by 25%
export const SURGING_SHOTS_DAMAGE_INCREASE = 0.25;
// Surging Shots gives a 15% chance for Aimed Shot to reset Rapid Fire cooldown
export const SURGING_SHOTS_RESET_CHANCE = 0.15;
/** Calling the Shots */
// 2.5 seconds CDR per 50 focus spent
export const CTS_CDR_PER_FOCUS = 2500 / 50;
/** Lock and Load */
// Lock and Load has a 10% chance to proc per auto attack
export const LNL_PROC_CHANCE = 0.1;
// When Lock and Load procs, Aimed Shot costs 0 focus
export const LNL_COST_MULTIPLIER = 0;
/** Streamline (removed in Midnight - Aimed Shot cast time is now baseline 2.5s) */
// Kept for reference but no longer active
// export const STREAMLINE_AIMED_SHOT_CAST_SPEED_UP = 0.3;
//endregion
//region Resources
/** Marksmanship specific focus spenders */
export const LIST_OF_FOCUS_SPENDERS_MM = [
  TALENTS.AIMED_SHOT_TALENT,
  SPELLS.ARCANE_SHOT,
  TALENTS.KILL_SHOT_TALENT,
  SPELLS.MULTISHOT_MM,
  SPELLS.WING_CLIP,
  SPELLS.WAILING_ARROW_DAMAGE,
];
//endregion
