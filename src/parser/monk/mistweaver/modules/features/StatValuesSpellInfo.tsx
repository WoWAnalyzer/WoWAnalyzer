import SPELLS from 'common/SPELLS';

/*
 * Fields:
 * int: spell scales with Intellect
 * crit: spell scales with (is able to or procced from) Critical Strike
 * hasteHpm: spell does more healing due to Haste, e.g. HoTs that gain more ticks
 * hasteHpct: spell can be cast more frequently due to Haste, basically any spell except for non haste scaling CDs
 * mastery: spell is boosted by Mastery
 * masteryStack: spell's HoT counts as a Mastery Stack
 * vers: spell scales with Versatility
 * multiplier: spell scales with whatever procs it, should be ignored for purpose of weights and for 'total healing' number
 * ignored: spell should be ignored for purpose of stat weights
 */

// This only works with actual healing events; casts are not recognized.

export default {
  [SPELLS.ENVELOPING_MIST.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.ENVELOPING_MIST_TFT.id]: { // Instant Heal when using TFT-> Enveloping Mist
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.ESSENCE_FONT.id]: {
    int: true,
    crit: true,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.ESSENCE_FONT_BUFF.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.RENEWING_MIST_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: false,
    mastery: false, // Procs Gusts
    vers: true,
  },
  [SPELLS.VIVIFY.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false, // Procs Gusts
    vers: true,
  },
  [SPELLS.CHI_BURST_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.GUSTS_OF_MISTS.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: false,
    mastery: true, // Procs Gusts
    vers: false,
  },
  [SPELLS.SOOTHING_MIST.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.REFRESHING_JADE_WIND_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.REVIVAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.LIFE_COCOON.id]: {//life cocoon scales off of hp
    int: false,
    crit: false,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.RISING_MIST_HEAL.id]: { // t100 trait
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.HEALING_ELIXIR_TALENT.id]: { // t75 trait
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.SOOTHING_MIST_STATUE.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.ANCIENT_TEACHINGS_OF_THE_MONASTERY_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.GUST_OF_MISTS_CHIJI.id]: { // Chi-ji's gusts
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: true,
    vers: true,
  },
  [SPELLS.SOOTHING_BREATH.id]: { //Yu'lon's healing
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.ENVELOPING_BREATH.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.EXPEL_HARM.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.EXPEL_HARM_TARGET_HEAL.id]: {
    int: true,
    crit: true,
    hastHpm: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.TEAR_OF_MORNING_HEAL.id]: {
    int: false,
    crit: false,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    vers: false,
  },
  [SPELLS.FALLEN_ORDER_ENVELOPING_MIST.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.FALLEN_ORDER_SOOTHING_MIST.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.FAELINE_STOMP_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.FAELINE_STOMP_ESSENCE_FONT.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.BONEDUST_BREW_HEAL.id]: {
    int: true,
    crit: false,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.BONEDUST_BREW_GUST_OF_MIST.id]: {
    int: true,
    crit: false,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
};
