import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';

//region Spells

/** Cobra Shot */
//Cobra Shot reduces the cooldown of Kill Command by 2 seconds by default
export const COBRA_SHOT_CDR_MS = 2000;
//A threshold where you can never realistically overcap on focus by waiting for AT MOST 1 GCD + 1 second.
export const COBRA_SHOT_FOCUS_THRESHOLD_TO_WAIT = 50;
/** Kill Command */
//Kill Command costs 30 focus for Beast Mastery hunters
export const KILL_COMMAND_BM_FOCUS_COST = 30;
/** Bestial Wrath */
//Bestial Wrath
export const BARBED_SHOT_BESTIAL_WRATH_CDR_MS = 12000;
export const BESTIAL_WRATH_BASE_CD = 90000;
//endregion

//region Talents
/** Barbed Shot */
//max stacks your pet can have of the Frenzy buff
export const MAX_FRENZY_STACKS = 3;
//Frenzy lasts 8 seconds normally, but can be adjusted by some effects
export const ORIGINAL_FRENZY_DURATION = 8000;
/** Kindred Spirits */
export const KINDRED_SPIRITS_FOCUS_INCREASE = [0, 10, 20];
/** Pack Tactics */
export const PACK_TACTICS_FOCUS_REGEN_INCREASE = 2;
/** Bloodshed */
//Bloodshed increases the damage done by pets by 15%
export const BLOODSHED_DAMAGE_AMP = 0.15;
/** Dire Beast */
//Dire Beast increases haste by 5% while active
export const DIRE_BEAST_HASTE_PERCENT = 0.05;
/** Aspect of the Beast */
//Aspect of the Beast increase pet damage and healing done by 30%
export const AOTB_MULTIPLIER = 0.3;
//Aspect of the Beast does not affect all pet abilities
export const AOTB_ABILITIES_NOT_AFFECTED: number[] = [
  SPELLS.MELEE.id,
  TALENTS.KILL_COMMAND_SHARED_TALENT.id,
  SPELLS.STOMP_DAMAGE.id,
];
/** Killer Instinct */
//Killer Instinct is a execution like talent that activates at target hp sub 35%
export const KILLER_INSTINCT_THRESHOLD = 0.35;
//When Killer Instinct is active Kill Command does 50% more damage
export const KILLER_INSTINCT_MULTIPLIER = 0.5;

/** Stampede */
// The potential amount of hits per target per stampede cast.
// By checking through various Zek'voz logs, it seems to consistently hit the boss 18 times, except if the boss was moved.
// By using this number, we can calculate the average amount of targets hit per cast.
export const STAMPEDE_POTENTIAL_HITS = 18;
/** Stomp */
//If you have Animal Companion, Stomp will hit twice per cast - so we need to be aware of that
export const AMOUNT_OF_PETS_WITH_AC = 2;
/** Thrill of the Hunt */
//Thrill of the Hunt can stack up to 3 times
export const MAX_THRILL_STACKS = 3;
//Each stack of Thrill of the Hunt gives 3% crit
export const CRIT_PER_THRILL_STACK = 0.03;
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
//Minor threshold for focus wastage on focus generators
export const FOCUS_THRESHOLD_MINOR = 0.025;
//Average threshold for focus wastage on focus generators
export const FOCUS_THRESHOLD_AVG = 0.05;
//Major threshold for focus wastage on focus generators
export const FOCUS_THRESHOLD_MAJOR = 0.1;
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
  TALENTS.MULTI_SHOT_BEAST_MASTERY_TALENT,
  TALENTS.KILL_COMMAND_SHARED_TALENT,
  TALENTS.KILL_SHOT_SHARED_TALENT,
  TALENTS.A_MURDER_OF_CROWS_TALENT,
];
//endregion

//region Legendaries
/** Dire Command */
//Dire Command has a 30% chance to summon a dire beast
export const DIRE_COMMAND_PROC_CHANCE = 0.3;
/** Flamewaker's Cobra Sting */
//Flamewaker's Cobra Sting has a 50% chance to reduce focus cost of next Kill Command by 100%
export const FLAMEWAKERS_PROC_CHANCE = 0.5;
/** Qa'pla, Eredun War Order */
//Qa'pla increases Barbed Shot damage by 10%
export const QAPLA_BARBED_SHOT_DMG_INCREASE = 0.1;
/** Rylakstalker's Piercing Fangs */
//Rylakstalker's Piercing Fang increases pet crit damage by 35% during Bestial Wrath
export const RYLAKSTALKERS_PIERCING_FANGS_CRIT_DMG_INCREASE = 0.35;
//endregion
