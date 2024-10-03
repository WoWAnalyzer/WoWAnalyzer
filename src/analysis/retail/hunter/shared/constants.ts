import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';

//region Core
/** Abilities */
//A simple function to calculate hasted cooldowns
export const hastedCooldown = (baseCD: number, haste: number) => baseCD / (1 + haste);
/** MS Buffers */
//A 100ms buffer is standard to use since logs aren't precise to the millisecond for events
export const MS_BUFFER_100 = 100;
//Whenever we need to use 250ms buffers
export const MS_BUFFER_250 = 250;
//Whenever we ned to use 1 second buffers
export const ONE_SECOND_IN_MS = 1000;
/** Death Tracker */
//The override we use in the hunter version of the Death Tracker that allows for a hunter to be dead for 0.25% of an encounter without it counting towards death time as it could just be Feign Death
export const TIME_SPENT_DEAD_THRESHOLD = 0.0025; //0.25%
//endregion

//region Spells
/** Kill Shot */
//Kill Shot is castable on enemies sub 20% hp
export const KILL_SHOT_EXECUTE_RANGE = 0.2;
/** Aspects */
//This is the baseline cooldown of Aspect of the Turtle / Cheetah
export const BASELINE_TURTLE_CHEETAH_CD = 180000;
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
  TALENTS.SURVIVAL_OF_THE_FITTEST_TALENT,
];
//Born To Be Wild reduces the cooldown of affected spells by 20%
export const BORN_TO_BE_WILD_CD_REDUCTION = [0, 0.1, 0.2];
/** Natural Mending */
//1 second per 12 focus spent
export const NATURAL_MENDING_CDR_PER_FOCUS = 1000 / 12;
/** Survival of the Fittest */
export const SURVIVAL_OF_THE_FITTEST_BASE_CD = 120000;
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
  TALENTS.BARRAGE_TALENT,
  TALENTS.EXPLOSIVE_SHOT_TALENT,
  SPELLS.ARCANE_SHOT,
  TALENTS.SCARE_BEAST_TALENT,
];
//endregion
