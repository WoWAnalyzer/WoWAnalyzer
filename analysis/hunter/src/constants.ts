import SPELLS from 'common/SPELLS';

//region Core
/** Abilities */
//A simple function to calculate hasted cooldowns
export const hastedCooldown = (baseCD: number, haste: number) => (baseCD / (1 + haste));
/** GCDs */
//Hunter GCDs don't go below 750ms
export const MIN_GCD = 750;
//Hunter GCDs don't go above 1500ms
export const MAX_GCD = 1500;
/** MS Buffers */
//A 100ms buffer is standard to use since logs aren't precise to the millisecond for events
export const MS_BUFFER = 100;
//Whenever we ned to use 1 second buffers
export const ONE_SECOND_IN_MS = 1000;
//Whenever we need to use a buffer that is slightly above that of the maximum GCD
export const OVER_1_GCD_BUFFER = 2000;
/** Death Tracker */
//The override we use in the hunter version of the Death Tracker that allows for a hunter to be dead for 0.25% of an encounter without it counting towards death time as it could just be Feign Death
export const TIME_SPENT_DEAD_THRESHOLD = 0.0025; //0.25%
//endregion

//region Spells
/** Kill Shot */
//Kill Shot is castable on enemies sub 20% hp
export const KILL_SHOT_EXECUTE_RANGE = 0.2;
/** Multi Shot */
//List of Multi Shots for use in Rapid Reload module
export const MULTI_SHOTS_LIST = [
  SPELLS.MULTISHOT_BM,
  SPELLS.MULTISHOT_MM,
];
/** Aspects */
//This is the baseline cooldown of Aspect of the Turtle / Cheetah
export const BASELINE_TURTLE_CHEETAH_CD = 180000;
/** Dire Beast (and also Dire Consequences) */
//Dire Beast (and therefore also Dire Consequences) increases haste by 5% while active
export const DIRE_BEAST_HASTE_PERCENT = 0.05;
//endregion

//region Talents
/** A Murder of Crows */
//A Murder of Crows ticks every 1 seconds
export const AMOC_TICK_RATE = 1000;
//A murder of Crows lasts up to 15 seconds, we use this to calculate whether or not it has been reset
export const AMOC_BASE_DURATION = 15000;
/** Barrage */
//Barrage hits up to 10 times per cast
export const BARRAGE_HITS_PER_CAST = 10;
/** Born to be Wild */
//Born To Be Wild reduces the cooldown of these three aspect abilities
export const BORN_TO_BE_WILD_AFFECTED_SPELLS = [
  SPELLS.ASPECT_OF_THE_CHEETAH,
  SPELLS.ASPECT_OF_THE_TURTLE,
  SPELLS.ASPECT_OF_THE_EAGLE,
];
//Born To Be Wild reduces the cooldown of affected spells by 20%
export const BORN_TO_BE_WILD_CD_REDUCTION = 0.2;
/** Natural Mending */
//1 second per 20 focus spent
export const MM_SV_CDR_PER_FOCUS = 1000 / 20;
//1 second per 30 focus spent
export const BM_CDR_PER_FOCUS = 1000 / 30;
//endregion

//region Resources
/** Focus */
//Hunter has a baseline focus regen of 5
export const HUNTER_BASE_FOCUS_REGEN = 5;
//Hunter has a baseline max focus of 100
export const HUNTER_BASE_FOCUS_MAX = 100;
//Generic minor threshold for focus waste
export const RESOURCES_HUNTER_MINOR_THRESHOLD = 0.05;
//Generic average threshold for focus waste
export const RESOURCES_HUNTER_AVERAGE_THRESHOLD = 0.1;
//Generic major threshold for focus waste
export const RESOURCES_HUNTER_MAJOR_THRESHOLD = 0.15;
/** Focus Spenders that are shared across the specs */
export const LIST_OF_FOCUS_SPENDERS_SHARED = [
  SPELLS.REVIVE_PET,
  SPELLS.A_MURDER_OF_CROWS_TALENT,
  SPELLS.BARRAGE_TALENT,
  SPELLS.ARCANE_SHOT,
];
//endregion

//region Legendaries
//Call of the Wild reduces the cooldown of affected spells by 35%
export const CALL_OF_THE_WILD_CD_REDUCTION = 0.35;
//Call of the Wild affects all Aspects as well as Trueshot and Coordinated Assault
export const CALL_OF_THE_WILD_AFFECTED_SPELLS = [
  SPELLS.ASPECT_OF_THE_CHEETAH,
  SPELLS.ASPECT_OF_THE_TURTLE,
  SPELLS.ASPECT_OF_THE_EAGLE,
  SPELLS.ASPECT_OF_THE_WILD,
  SPELLS.TRUESHOT,
  SPELLS.COORDINATED_ASSAULT,
];
//Nesingwary's Trapping Apparatus increases focus generation by 100%
export const NESINGWARY_FOCUS_GAIN_MULTIPLIER = 2;
//endregion

//region Covenants

//region Kyrian
/** Resonating Arrow */
//Resonating Arrow increases crit chance for enemies affected by its debuff
export const RESONATING_ARROW_CRIT_INCREASE = 0.3;
//endregion

//region Night Fae
/** Wild Spirits */
//Wild Mark is a Hunters Mark-like effect increasing damage done to targets affected by it by 5%
export const WILD_MARK_DAMAGE_AMP = 0.05;
//Wild Spirits lasts 15 seconds baseline
export const WILD_SPIRITS_BASELINE_DURATION = 15000;
//endregion

//region Venthyr
/** Flayed Shot */
//Flayed Shot has a 15% chance to reset Kill Shot (and allow it to be used on a target regardless of HP) every damage tick
export const FLAYED_SHOT_RESET_CHANCE = 0.15;
//endregion

//endregion

//region Conduits
//region Kyrian
/** Enfeebled Mark */
//Enfeebled Mark increases the damage against targets affected by Resonating Arrow
export const ENFEEBLED_MARK_DAMAGE_INCREASE = [0, 0.05, 0.055, 0.06, 0.0675, 0.075, 0.0825, 0.09, 0.0975, 0.105, 0.1125, 0.12, 0.1275, 0.135, 0.1425, 0.15];
//endregion

//region Necrolord
/** Necrotic Barrage  */
//Necrotic Barrage makes Death Chakram generate 2 additional focus
export const NECROTIC_BARRAGE_ADDITIONAL_FOCUS = 2;
//Necrotic Barrage makes Death Chakram do additional damage
export const NECROTIC_BARRAGE_DAMAGE_INCREASE = [0, 0.05, 0.06, 0.07, 0.085, 0.095, 0.105, 0.115, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.20];
//endregion

//region Night Fae
/** Spirit Attunement */
//Spirit Attunement increases the duration of Wild Spirits by 3 seconds
export const SPIRIT_ATTUNEMENT_DURATION_INCREASE = 3000;
//Spirit Attunement increases damage done by Wild Spirits by X%
export const SPIRIT_ATTUNEMENT_DAMAGE_INCREASE = [0, 0.10, 0.11, 0.12, 0.135, 0.145, 0.155, 0.165, 0.18, 0.19, 0.20, 0.21, 0.22, 0.23, 0.24, 0.25];
//endregion

//region Venthyr
/** Empowered Release */
//Empowered Release increases Flayed Shot proc chance by 5%, not increasing with ranks.
export const EMPOWERED_RELEASE_INCREASED_FLAYED_PROC_CHANCE = 0.05;
//Empowered Release makes Flayer's Mark also increase the damage of next Kill Shot by 5.0% (scaling)
export const EMPOWERED_RELEASE_INCREASE_KS_DAMAGE = [0, 0.05, 0.06, 0.07, 0.085, 0.095, 0.105, 0.115, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.20];
//endregion

//region Endurance
export const HARMONY_OF_THE_TORTOLLAN_EFFECT_BY_RANK: number[] = [0, 10, 11.5, 13, 14.5, 16, 17.5, 19, 20.5, 23, 24.5, 26, 27.5, 29, 30.5, 32];
export const MARKMANS_ADVANTAGE_EFFECT_BY_RANK = [0, 0.03, 0.035, 0.04, 0.045, 0.05, 0.055, 0.06, 0.065, 0.07, 0.075, 0.08, 0.085, 0.09, 0.095, 0.1];
export const RESILIENCE_OF_THE_HUNTER_EFFECT_BY_RANK = [0, 0.03, 0.038, 0.046, 0.054, 0.062, 0.07, 0.078, 0.086, 0.094, 0.102, 0.11, 0.118, 0.126, 0.134, 0.142];
//endregion

//region Finesse
export const REVERSAL_OF_FORTUNE_EFFECT_BY_RANK = [0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
//endregion

//endregion
