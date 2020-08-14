import SPELLS from 'common/SPELLS';

//region Spells
/** Rapid Fire */
//Rapid Fire ticks 10 times per cast baseline
export const RAPID_FIRE_TICKS_PER_CAST = 10;
/** Trueshot */
//Trueshot makes Aimed Shot recharge 225% faster despite what its tooltip says
export const TRUESHOT_AIMED_SHOT_RECHARGE_INCREASE = 2.25;
//Trueshot makes Rapid Fire recharge 240% faster despite what its tooltip says
export const TRUESHOT_RAPID_FIRE_RECHARGE_INCREASE = 2.4;
/** Lone Wolf */
//Lone Wolf increases damage done by up to 10%
export const MAX_LONE_WOLF_MODIFIER = 0.10;
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
  SPELLS.AIMED_SHOT,
  SPELLS.STEADY_SHOT,
  SPELLS.BARRAGE_TALENT,
  SPELLS.A_MURDER_OF_CROWS_DEBUFF,
  SPELLS.CHIMAERA_SHOT_FROST_DAMAGE,
  SPELLS.CHIMAERA_SHOT_NATURE_DAMAGE,
  SPELLS.ARCANE_SHOT,
  SPELLS.BURSTING_SHOT,
  SPELLS.EXPLOSIVE_SHOT_DAMAGE,
  SPELLS.SERPENT_STING_TALENT,
  SPELLS.VOLLEY_DAMAGE,
  SPELLS.RAPID_FIRE,
  SPELLS.KILL_SHOT_MM_BM,
];
/** Precise Shots */
//Logs give no indication whether we gain 1 or 2 stacks - we assume 2 and work from there.
export const PRECISE_SHOTS_ASSUMED_PROCS = 2;
//Precise Shots increase damage of Arcane or Multi-Shot by 75%
export const PRECISE_SHOTS_MODIFIER = 0.75;
//Because the spells have traveltime we need to take it into account
export const ARCANE_SHOT_MAX_TRAVEL_TIME = 500;
//endregion

//region Talents
/** Streamline */
//Streamline increases amount of Rapid Fire ticks by 20%
export const STREAMLINE_TICK_INCREASE = 0.2;
/** Steady Focus */
//Each Stack of Steady Focus decrease Steady Shot cast time by 20%
export const STEADY_FOCUS_GCD_REDUCTION_PER_STACK = 0.2;
//Steady Focus stacks up to 2 times
export const STEADY_FOCUS_MAX_STACKS = 2;
/** Master Marksman */
//Master Marksman increases Aimed Shot crit chance by 25%
export const MASTER_MARKSMAN_CRIT_INCREASE = 0.25;
/** Dead Eye */
//Dead Eye increases the Aimed Shot recharge rate by 200%, despite tooltip saying it is 50%
export const DEAD_EYE_AIMED_SHOT_RECHARGE_INCREASE = 2;
/** Calling the Shots */
//Calling the Shots makes Arcane Shot and Multi Shot decrease Trueshot cooldown by 2.5s
export const CTS_CDR_MS = 2500;
/** Careful Aim */
//Careful Aim is a execution-like talent that triggers off above 70%
export const CAREFUL_AIM_THRESHOLD = 0.7;
//Careful Aim increases Aimed Shot damage by 50% when active
export const CA_MODIFIER = .5;
/** Lock and Load */
//Lock and Load has a 5% chance to proc per auto attack
export const LNL_PROC_CHANCE = 0.05;
//When Lock and Load procs, Aimed Shot costs 0 focus
export const LNL_COST_MULTIPLIER = 0;
//endregion

//region Resources
/** Marksmanship specific focus spenders */
export const LIST_OF_FOCUS_SPENDERS_MM = [
  SPELLS.AIMED_SHOT,
  SPELLS.SERPENT_STING_TALENT,
  SPELLS.MULTISHOT_MM,
  SPELLS.BURSTING_SHOT,
  SPELLS.EXPLOSIVE_SHOT_TALENT,
];
//endregion

//region Azerite Traits
/** In The Rhythm */
//In The Rhythm lasts for 8 seconds, we use this to determine too early refreshes
export const IN_THE_RHYTHM_DURATION = 8000;
/** Steady Aim */
//Steady Aim can stack up to 5 times
export const STEADY_AIM_MAX_STACKS = 5;
/** Surging Shots */
//Surging Shots starts by increasing damage by 50%
export const SUS_INITIAL_DAMAGE_MOD = 0.5;
//Surging Shots then increases its rampdamage by 20% per tick
export const SUS_RAMP_UP_MOD = 0.2;
/** Unerring Vision */
//Unerring Vision stacks up to 10 times, regardless of Trueshot increasing in duration
export const UV_MAX_STACKS = 10;
//endregion
