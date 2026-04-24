import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';

//region Spells

/** Cobra Shot */
//Cobra Shot reduces the cooldown of Kill Command by 1 second by default
export const COBRA_SHOT_KC_CDR_MS = 1000;
export const BARBED_SCALES_CDR_MS = 2000;
export const MASTER_HANDLER_CDR_MS = 500;
export const WAR_ORDERS_CDR_MS = 3000;
//A threshold where you can never realistically overcap on focus by waiting for AT MOST 1 GCD + 1 second.
export const COBRA_SHOT_FOCUS_THRESHOLD_TO_WAIT = 50;
/** Bestial Wrath */
export const BESTIAL_WRATH_BASE_CD = 90000;
export const BESTIAL_WRATH_BEAST_WITHIN_CDR_MS = 60000;
export const BESTIAL_WRATH_DURATION_MS = 15000;
/** Withering Fire */
export const WITHERING_FIRE_DURATION_MS = 10000;
//endregion

//region Talents
/** Pack Tactics */
export const PACK_TACTICS_FOCUS_REGEN_INCREASE = 2;
export const PACK_MENTALITY_CDR_MS = 4000;
export const HOWL_BUFFS = [
  SPELLS.HOWL_OF_THE_PACKLEADER_WYVERN,
  SPELLS.HOWL_OF_THE_PACKLEADER_BEAR,
  SPELLS.HOWL_OF_THE_PACKLEADER_BOAR,
];

/** Dire Beast */
//Dire Beast lasts for 8 seconds baseline
export const DIRE_BEAST_BASE_DURATION = 8000;
/** Aspect of the Beast */
//Aspect of the Beast increase pet damage and healing done by 30%
export const AOTB_MULTIPLIER = 0.3;
//Aspect of the Beast does not affect all pet abilities
export const AOTB_ABILITIES_NOT_AFFECTED: number[] = [
  SPELLS.MELEE.id,
  TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id,
  SPELLS.STOMP_DAMAGE.id,
];
/** Stampede */
// The potential amount of hits per target per stampede cast.
// By checking through various Zek'voz logs, it seems to consistently hit the boss 18 times, except if the boss was moved.
// By using this number, we can calculate the average amount of targets hit per cast.
export const STAMPEDE_POTENTIAL_HITS = 18;
/** Stomp */
//If you have Animal Companion, Stomp will hit twice per cast - so we need to be aware of that
export const AMOUNT_OF_PETS_WITH_AC = 2;
/** Dire Command */
export const DIRE_COMMAND_PROC_CHANCE = 0.2;
//endregion

//region Pets
/** Pet Basic Attacks */
//There are three different Basic Attacks for Pets
export const BASIC_ATTACK_SPELLS = [
  SPELLS.BITE_BASIC_ATTACK,
  SPELLS.CLAW_BASIC_ATTACK,
  SPELLS.SMACK_BASIC_ATTACK,
];
//The actual current delay without macros is ~300ms on top of the 3 second cooldown, but adding 100 ms to act as a buffer.
export const MAX_TIME_BETWEEN_BASIC_ATK = 3400;
//The delay is reduced to ~100-200ms depending on latency when you macro the abilities
export const MACRO_TIME_BETWEEN_BASIC_ATK = 3150;
//This is what the optimal scenario would look like, if pet cast it instantly after it came off cooldown
export const NO_DELAY_TIME_BETWEEN_BASIC_ATK = 3000;
//endregion

//region Resources
/** Focus */
//Beast Mastery has 10 focus/second as baseline regen
export const BASE_BM_FOCUS_REGEN = 5;
//Beast Mastery has 120 focus at start
export const BASE_BM_FOCUS_MAX = 100;
//The 8 focus regen buffs connected to Barbed Shot
export const BARBED_SHOT_FOCUS_REGEN_BUFFS = [
  SPELLS.BARBED_SHOT_BUFF,
  SPELLS.BARBED_SHOT_BUFF_2,
  SPELLS.BARBED_SHOT_BUFF_3,
  SPELLS.BARBED_SHOT_BUFF_4,
  SPELLS.BARBED_SHOT_BUFF_5,
  SPELLS.BARBED_SHOT_BUFF_6,
  SPELLS.BARBED_SHOT_BUFF_7,
  SPELLS.BARBED_SHOT_BUFF_8,
];

export const BARBED_SHOT_FOCUS_REGEN_BUFFS_IDS = [
  SPELLS.BARBED_SHOT_BUFF.id,
  SPELLS.BARBED_SHOT_BUFF_2.id,
  SPELLS.BARBED_SHOT_BUFF_3.id,
  SPELLS.BARBED_SHOT_BUFF_4.id,
  SPELLS.BARBED_SHOT_BUFF_5.id,
  SPELLS.BARBED_SHOT_BUFF_6.id,
  SPELLS.BARBED_SHOT_BUFF_7.id,
  SPELLS.BARBED_SHOT_BUFF_8.id,
];
//Barbed Shot regenerates 5 focus per tick
export const BARBED_SHOT_REGEN = 5;
/** Focus Spenders specific to BM */
export const LIST_OF_FOCUS_SPENDERS_BM = [
  TALENTS.COBRA_SHOT_TALENT,
  TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT,
  TALENTS.WILD_THRASH_TALENT,
  SPELLS.WING_CLIP,
  SPELLS.BLACK_ARROW_DAMAGE,
  SPELLS.WAILING_ARROW_DAMAGE,
];
//endregion
