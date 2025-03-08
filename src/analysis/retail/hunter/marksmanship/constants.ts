import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';

//region Spells
/** Rapid Fire */
//Rapid Fire generates 1 focus per hit
export const RAPID_FIRE_FOCUS_PER_TICK = 1;
/** Aimed Shot */
//Aimed Shot has a baseline casttime of 2.5s
export const AIMED_SHOT_BASELINE_CAST_TIME = 2500;
/** Trueshot */
//Trueshot makes Aimed Shot recharge 225% faster despite what its tooltip says
export const TRUESHOT_AIMED_SHOT_RECHARGE_INCREASE = 2.25;
//Trueshot makes Rapid Fire recharge 240% faster despite what its tooltip says
export const TRUESHOT_RAPID_FIRE_RECHARGE_INCREASE = 2.4;
//Trueshot increases the cast rate of Aimed Shot by 50%
export const TRUESHOT_AIMED_SHOT_CAST_TIME_SPEED_UP = 0.5;
//Trueshot increases focus regen by 50%
export const TRUESHOT_FOCUS_INCREASE = 0.5;
/** Lone Wolf */
//Lone Wolf increases damage done by up to 5%
export const MAX_LONE_WOLF_MODIFIER = 0.05;
//Lone Wolf ramps up every 2 seconds if it isn't capped
export const LONE_WOLF_RAMP_INTERVAL_MS = 2000;
//Lone Wolf increases its damage done by 1% every 2 seconds
export const LONE_WOLF_INCREASE_PER_RAMP = 0.01;
//Lone Wolf starts at 0% increased damage after dismissing pet
export const START_LONE_WOLF_MODIFIER = 0;
//Lone Wolf modifies the following abilities
export const LONE_WOLF_AFFECTED_SPELLS = [
  SPELLS.AUTO_SHOT,
  SPELLS.MULTISHOT_MM,
  TALENTS.AIMED_SHOT_TALENT,
  SPELLS.STEADY_SHOT,
  TALENTS.BARRAGE_TALENT,
  SPELLS.A_MURDER_OF_CROWS_DEBUFF,
  SPELLS.CHIMAERA_SHOT_MM_FROST_DAMAGE,
  SPELLS.CHIMAERA_SHOT_MM_NATURE_DAMAGE,
  SPELLS.ARCANE_SHOT,
  SPELLS.BURSTING_SHOT,
  SPELLS.EXPLOSIVE_SHOT_DAMAGE,
  SPELLS.VOLLEY_DAMAGE,
  SPELLS.RAPID_FIRE,
  SPELLS.KILL_SHOT_MM_BM,
];
/** Precise Shots */
//Changes from 11.05 has made it so this is definitely 1 proc
export const PRECISE_SHOTS_ASSUMED_PROCS = 1;
//Precise Shots increase damage of Arcane or Multi-Shot by 100%
export const PRECISE_SHOTS_MODIFIER = 1;
//Because the spells have traveltime we need to take it into account
export const ARCANE_SHOT_MAX_TRAVEL_TIME = 500;
/** Steady Shot */
//Steady Shot regenerates 10 focus baseline on cast
export const STEADY_SHOT_FOCUS_REGEN = 10;
//endregion

//region Talents
/** Streamline */
//Streamline increases the damage of Rapid Fire by 15%
export const STREAMLINE_RAPID_FIRE_DAMAGE_INCREASE = 0.15;
//Rapid Fire causes the next Aimed Shot to cast 30% faster.
export const STREAMLINE_AIMED_SHOT_CAST_SPEED_UP = 0.3;
/** Steady Focus */
//Steady Focus increases haste by 8%
export const STEADY_FOCUS_HASTE_PERCENT = [0, 0.08];
/** Calling the Shots */
//2.5 seconds per 50 focus spent
export const CTS_CDR_PER_FOCUS = 2500 / 50;
/** Careful Aim */
//Careful Aim is a execution-like talent that triggers off above 70%
export const CAREFUL_AIM_THRESHOLD = 0.7;
//Careful Aim increases Aimed Shot damage by 50% when active
export const CA_MODIFIER = 0.5;
/** Lock and Load */
//Lock and Load has a 8% chance to proc per auto attack
export const LNL_PROC_CHANCE = 0.08;
//When Lock and Load procs, Aimed Shot costs 0 focus
export const LNL_COST_MULTIPLIER = 0;
/** Serpent Sting */
//Serpent Sting has a 18 second duration for Marksmanship
export const SERPENT_STING_MM_BASE_DURATION = 18000;
//Serpent Sting pandemics at 30%
export const SERPENT_STING_MM_PANDEMIC = 0.3;
//Tactial Reload reduces cooldown of Aimed Shot and Rapid Fire by 10%
export const TACTICAL_RELOAD_CDR_REDUCTION = 0.1;
//endregion

//region Resources
/** Marksmanship specific focus spenders */
export const LIST_OF_FOCUS_SPENDERS_MM = [
  TALENTS.AIMED_SHOT_TALENT,
  SPELLS.ARCANE_SHOT,
  TALENTS.KILL_SHOT_SHARED_TALENT,
  SPELLS.MULTISHOT_MM,
  TALENTS.BURSTING_SHOT_TALENT,
  TALENTS.EXPLOSIVE_SHOT_TALENT,
  SPELLS.WING_CLIP,
  SPELLS.WAILING_ARROW_DAMAGE_FOCUS,
];
//endregion

//region Legendaries
/** Surging Shots */
//Surging Shots increases the damage of Rapid Fire by 35%
export const SURGING_SHOTS_DAMAGE_INCREASE = 0.35;
//Surging Shots gives 15% chance for Aimed Shot to reset the cooldown of Rapid Fire
export const SURGING_SHOTS_RESET_CHANCE = 0.15;
/** Eagletalon's True Focus */
//Eagletalon's True Focus makes Trueshot reduces focus cost of all abilities by 25%
export const EAGLETALONS_TRUE_FOCUS_COST_REDUCTION = 0.25;
//Eagletalon's True Focus makes Trueshot last 3 seconds longer
export const EAGLETALONS_TRUE_FOCUS_TRUESHOT_DURATION_INCREASE = 3000;
//endregion
