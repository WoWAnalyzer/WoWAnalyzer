import SPELLS from 'common/SPELLS';

//region Spells
/** Rapid Fire */
//Rapid Fire ticks 7 times per cast baseline
export const RAPID_FIRE_TICKS_PER_CAST = 7;
//Rapid Fire generates 1 focus per hit
export const RAPID_FIRE_FOCUS_PER_TICK = 1;
/** Aimed Shot */
//Aimed Shot has a baseline casttime of 2.5s
export const AIMED_SHOT_BASELINE_CAST_TIME = 2500;
//Aimed Shot costs 35 focus baseline
export const AIMED_SHOT_FOCUS_COST = 35;
/** Trueshot */
//Trueshot makes Aimed Shot recharge 225% faster despite what its tooltip says
export const TRUESHOT_AIMED_SHOT_RECHARGE_INCREASE = 2.25;
//Trueshot makes Rapid Fire recharge 240% faster despite what its tooltip says
export const TRUESHOT_RAPID_FIRE_RECHARGE_INCREASE = 2.4;
//Trueshot increases the cast rate of Aimed Shot by 50%
export const TRUESHOT_AIMED_SHOT_CAST_TIME_SPEED_UP = 0.5;
//Trueshot lasts 15 seconds by default
export const TRUESHOT_DURATION_BASELINE = 15000;
//Trueshot increases focus regen by 50%
export const TRUESHOT_FOCUS_INCREASE = 0.5;
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
  SPELLS.CHIMAERA_SHOT_MM_FROST_DAMAGE,
  SPELLS.CHIMAERA_SHOT_MM_NATURE_DAMAGE,
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
/** Trick Shots */
//Trick Shots baseline does 50% damage to secondary targets
export const TRICK_SHOTS_BASELINE_DAMAGE = 0.5;
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
//Steady Focus increases haste by 7%
export const STEADY_FOCUS_HASTE_PERCENT = 0.07;
/** Master Marksman */
//Master Marksman makes special shot crits apply a 15% DOT
export const MASTER_MARKSMAN_CRIT_DOT = 0.15;
//Master Marksman ticks every two seconds
export const MASTER_MARKSMAN_TICK_RATE = 2000;
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
//Lock and Load has a 8% chance to proc per auto attack
export const LNL_PROC_CHANCE = 0.08;
//When Lock and Load procs, Aimed Shot costs 0 focus
export const LNL_COST_MULTIPLIER = 0;
/** Lethal Shots */
//Lethal Shot has a 30% chance per Arcane Shot / Multi Shot / Chimaera Shot hit
export const LETHAL_SHOTS_CHANCE = 0.3;
//Lethal Shot procs reduce cooldown of Rapid Fire
export const LETHAL_SHOTS_REDUCTION = 5000;
/** Serpent Sting */
//Serpent Sting has a 18 second duration for Marksmanship
export const SERPENT_STING_MM_BASE_DURATION = 18000;
//Serpent Sting pandemics at 30%
export const SERPENT_STING_MM_PANDEMIC = 0.3;
//endregion

//region Resources
/** Marksmanship specific focus spenders */
export const LIST_OF_FOCUS_SPENDERS_MM = [
  SPELLS.AIMED_SHOT,
  SPELLS.ARCANE_SHOT,
  SPELLS.SERPENT_STING_TALENT,
  SPELLS.MULTISHOT_MM,
  SPELLS.BURSTING_SHOT,
  SPELLS.EXPLOSIVE_SHOT_TALENT,
];
//endregion

//region Conduits
/** Brutal Projectiles */
//With Brutal Projectiles your auto attacks have a 10%
export const BRUTAL_PROJECTILES_PROC_CHANCE = 0.1;
//Each Shot of Rapid Fire increases damage more and more over its duration
export const BRUTAL_PROJECTILES_RAMP_DAMAGE = [0, 0.01, 1.25, 0.015, 0.02, 0.0225, 0.025, 0.0275, 0.0325, 0.035, 0.0375, 0.04, 0.0425, 0.045, 0.0475, 0.05];
/** Deadly Chain */
//With Deadly Chain your trickshots damage is increased
export const DEADLY_CHAIN_TRICKSHOTS_DAMAGE_INCREASE = [0, 0.10, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.18, 0.19, 0.20, 0.21, 0.22, 0.23, 0.24, 0.25];
/** Powerful Precision */
//With Powerful Precision Precise Shots further increases the damage of Arcane Shot, Chimaera Shots and Multi-Shot
export const POWERFUL_PRECISION_DAMAGE_INCREASE = [0, 0.05, 0.06, 0.07, 0.08, 0.10, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.20];
/** Sharpshooter's Focus */
//With Sharpshooter's Focus, Trueshot lasts x% longer
export const SHARPSHOOTERS_FOCUS_INCREASE_TRUESHOT_DURATION = [0, 0.20, 0.22, 0.24, 0.27, 0.29, 0.31, 0.33, 0.36, 0.38, 0.40, 0.42, 0.44, 0.46, 0.48, 0.50];
//endregion

//region Legendaries
/** Surging Shots */
//Surging Shots increases the damage of Rapid Fire by 25%
export const SURGING_SHOTS_DAMAGE_INCREASE = 0.25;
//Surging Shots gives 15% chance for Aimed Shot to reset the cooldown of Rapid Fire
export const SURGING_SHOTS_RESET_CHANCE = 0.15;
/** Eagletalon's True Focus */
//Eagletalon's True Focus makes Trueshot reduces focus cost of all abilities by 50%
export const EAGLETALONS_TRUE_FOCUS_COST_REDUCTION = 0.5;
/** Secrets of the Unblinking Vigil */
//Secrets of the Unblinking Vigil has 50% chance to proc on gaining Trick Shots
export const SECRETS_UNBLINKING_PROC_CHANCE = 0.5;
//The Secrets of the Unblinking Vigil buff makes Aimed Shot cost 0 focus (100% reduction).
export const SECRETS_UNBLINKING_FOCUS_COST_REDUCTION = 1;
//endregion
