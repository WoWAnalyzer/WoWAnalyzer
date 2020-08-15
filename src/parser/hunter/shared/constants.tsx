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
/** Hunters Mark */
//Hunters Mark increases all damage done by 5%
export const HUNTERS_MARK_MODIFIER = 0.05;
/** Aspects */
//This is the baseline cooldown of Aspect of the Turtle / Cheetah
export const BASELINE_TURTLE_CHEETAH_CD = 180000;
/** Dire Beast (and also Dire Consequences) */
//Dire Beast (and therefore also Dire Consequences) increases haste by 5% while active
export const DIRE_BEAST_HASTE_PERCENT= 0.05;
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
  SPELLS.ASPECT_OF_THE_CHEETAH.id,
  SPELLS.ASPECT_OF_THE_TURTLE.id,
  SPELLS.ASPECT_OF_THE_EAGLE.id,
];

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
//Chimaera Shot regenerates 10 focus per hit
export const CHIM_REGEN = 10;
/** Focus Spenders that are shared across the specs */
export const LIST_OF_FOCUS_SPENDERS_SHARED = [
  SPELLS.REVIVE_PET,
  SPELLS.A_MURDER_OF_CROWS_TALENT,
  SPELLS.BARRAGE_TALENT,
  SPELLS.ARCANE_SHOT,
];
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
//endregion

//region Venthyr
/** Flayed Shot */
//Flayed Shot has a 15% chance to reset Kill Shot (and allow it to be used on a target regardless of HP) every damage tick
export const FLAYED_SHOT_RESET_CHANCE = 0.15;
//endregion

//endregion
