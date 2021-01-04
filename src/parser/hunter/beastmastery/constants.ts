import SPELLS from 'common/SPELLS';

//region Spells
/** Barbed Shot */
//max stacks your pet can have of the Frenzy buff
export const MAX_FRENZY_STACKS = 3;
//Frenzy lasts 8 seconds normally, but can be adjusted by some effects
export const ORIGINAL_FRENZY_DURATION = 8000;
/** Cobra Shot */
//Cobra Shot reduces the cooldown of Kill Command by 1 second by default
export const COBRA_SHOT_CDR_MS = 1000;
//A threshold where you can never realistically overcap on focus by waiting for AT MOST 1 GCD + 1 second.
export const COBRA_SHOT_FOCUS_THRESHOLD_TO_WAIT = 50;
/** Kill Command */
//Kill Command costs 30 focus for Beast Mastery hunters
export const KILL_COMMAND_BM_FOCUS_COST = 30;
/** Bestial Wrath */
//Bestial Wrath
export const BARBED_SHOT_BESTIAL_WRATH_CDR_MS = 12000;
export const BESTIAL_WRATH_BASE_CD = 90000;
/** Aspect of the Wild */
//Aspect of the Wild reduces the GCD of certain abilities
export const AOTW_GCD_REDUCTION_AFFECTED_ABILITIES = [
  SPELLS.KILL_COMMAND_CAST_BM.id,
  SPELLS.COBRA_SHOT.id,
  SPELLS.BESTIAL_WRATH.id,
  SPELLS.MULTISHOT_BM.id,
  SPELLS.BARBED_SHOT.id,
  SPELLS.ASPECT_OF_THE_WILD.id,
  SPELLS.CALL_PET_1.id,
  SPELLS.CALL_PET_2.id,
  SPELLS.CALL_PET_3.id,
  SPELLS.CALL_PET_4.id,
  SPELLS.CALL_PET_5.id,
  SPELLS.INTIMIDATION.id,
  SPELLS.FREEZING_TRAP.id,
  SPELLS.TAR_TRAP.id,
  SPELLS.HUNTERS_MARK.id,
  SPELLS.ARCANE_SHOT.id,
  SPELLS.EXHILARATION.id,
  SPELLS.FLARE.id,
  SPELLS.BLOODSHED_TALENT.id,
  SPELLS.DIRE_BEAST_TALENT.id,
  SPELLS.SPITTING_COBRA_TALENT.id,
  SPELLS.BARRAGE_TALENT.id,
  SPELLS.STAMPEDE_TALENT.id,
  SPELLS.CHIMAERA_SHOT_TALENT_BEAST_MASTERY.id,
  SPELLS.A_MURDER_OF_CROWS_TALENT.id,
  SPELLS.WILD_SPIRITS.id,
  SPELLS.FLAYED_SHOT.id,
  SPELLS.RESONATING_ARROW.id,
  SPELLS.DEATH_CHAKRAM_INITIAL_AND_AOE.id,
];
//Aspect of the Wild gives 5 focus per second
export const ASPECT_OF_THE_WILD_FOCUS = 5;
//endregion

//region Talents
/** Bloodshed */
//Bloodshed increases the damage done by pets by 15%
export const BLOODSHED_DAMAGE_AMP = 0.15;
/** Scent of Blood */
//Scent of Blood recharges 2 barbed shot charges when you activate Bestial Wrath
export const SCENT_OF_BLOOD_BARBED_SHOT_RECHARGE = 2;
/** Aspect of the Beast */
//Aspect of the Beast increase pet damage and healing done by 30%
export const AOTB_MULTIPLIER = 0.3;
//Aspect of the Beast does not affect all pet abilities
export const AOTB_ABILITIES_NOT_AFFECTED: number[] = [
  SPELLS.MELEE.id,
  SPELLS.KILL_COMMAND_DAMAGE_BM.id,
  SPELLS.STOMP_DAMAGE.id,
];
/** Killer Instinct */
//Killer Instinct is a execution like talent that activates at target hp sub 35%
export const KILLER_INSTINCT_THRESHOLD = 0.35;
//When Killer Instinct is active Kill Command does 50% more damage
export const KILLER_INSTINCT_MULTIPLIER = 0.5;
/** Wild Call */
//Wild Call has a 20% chance to reset Barbed Shot cooldown on critical auto attacks
export const WILD_CALL_RESET_PERCENT = 0.2;
/** Spitting Cobra */
//Spitting Cobra has its damage increased by 10% for every Cobra Shot during Bestial Wrath
export const SPITTING_COBRA_DAMAGE_INCREASE = 0.1;
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
export const BASIC_ATTACK_SPELLS = [SPELLS.BITE_BASIC_ATTACK, SPELLS.CLAW_BASIC_ATTACK, SPELLS.SMACK_BASIC_ATTACK];
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
export const BEAST_MASTERY_FOCUS_REGEN = 10;
//Beast Mastery has 120 focus at start
export const BEAST_MASTERY_FOCUS_MAX = 120;
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
//Some energize spells don't have waste attached to their events
export const BEAST_MASTERY_SPELLS_WITHOUT_WASTE = [
  SPELLS.ASPECT_OF_THE_WILD.id,
  SPELLS.CHIMAERA_SHOT_FOCUS.id,
  ...BARBED_SHOT_FOCUS_REGEN_BUFFS_IDS,
];
//Barbed Shot regenerates 5 focus per tick
export const BARBED_SHOT_REGEN = 5;
//Aspect of the Wild regenerates 5 focus per tick
export const AOTW_REGEN = 5;
//Chimaera Shot regenerates 10 focus per hit for BM hunters
export const CHIM_REGEN = 10;
/** Focus Spenders specific to BM */
export const LIST_OF_FOCUS_SPENDERS_BM = [
  SPELLS.COBRA_SHOT,
  SPELLS.MULTISHOT_BM,
  SPELLS.KILL_COMMAND_CAST_BM,
  SPELLS.DIRE_BEAST_TALENT,
];
//endregion

//region Conduits
/** Ferocious Appetite */
//Ferocious Appetite causes Kill Command crits to reduce the cooldown of Aspect of the Wild with X seconds.
export const FEROCIOUS_APPETITE_ASPECT_REDUCTION = [0, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400];
/** One With the Beast */
//One With the Beast increases all damage done during Bestial Wrath
export const ONE_WITH_THE_BEAST_DAMAGE_INCREASE = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10, 0.11, 0.12, 0.13, 0.14, 0.15];
/** Bloodletting */
//Bloodletting reduces the recharge time of Barbed Shot by 1 second
export const BLOODLETTING_BARBED_SHOT_RECHARGE_REDUCTION = 1000;
//Bloodletting increases the damage done by x%
export const BLOODLETTING_BARBED_DOT_INCREASE = [0, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.18, 0.19, 0.2, 0.21, 0.22, 0.23, 0.24, 0.25];
/** Echoing Call */
//Wild Call has a % increase chance to reset the cooldown of Barbed Shot
export const ECHOING_CALL_INCREASED_WILD_CALL_CHANCE = [0, 0.05, 0.06, 0.06, 0.07, 0.07, 0.08, 0.08, 0.09, 0.09, 0.1, 0.1, 0.11, 0.11, 0.12, 0.12];
//endregion

//region Legendaries
/** Dire Command */
//Dire Command has a 20% chance to summon a dire beast
export const DIRE_COMMAND_PROC_CHANCE = 0.2;
/** Flamewaker's Cobra Sting */
//Flamewaker's Cobra Sting has a 25% chance to reduce focus cost of next Kill Command by 100%
export const FLAMEWAKERS_PROC_CHANCE = 0.25;
/** Qa'pla, Eredun War Order */
//Qa'pla reduces the cooldown of Kill Command by 5 seconds everytime you cast Barbed Shot
export const QAPLA_KILL_COMMAND_REDUCTION_MS = 5000;
/** Rylakstalker's Piercing Fangs */
//Rylakstalker's Piercing Fang increases pet crit damage by 20% during Bestial Wrath
export const RYLAKSTALKERS_PIERCING_FANGS_CRIT_DMG_INCREASE = 0.20;
//endregion
