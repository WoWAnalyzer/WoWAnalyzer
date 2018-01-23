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
  [SPELLS.ENVELOPING_MISTS.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: true, //Procs Gusts
    vers: true,
  },
  [SPELLS.ESSENCE_FONT.id]: {
    int: true,
    crit: true,
    hasteHpct: false,
    mastery: false, 
    vers: true,
  },
  [SPELLS.RENEWING_MIST_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: false,
    mastery: true, // Procs Gusts
    vers: true,
  },
  [SPELLS.SHEILUNS_GIFT.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: true, // Procs Gusts
    vers: true,
  },
  [SPELLS.VIVIFY.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: true, // Procs Gusts
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
  [SPELLS.GUSTS_OF_MIST.id]: {
    int: false,
    crit: true,
    hasteHpm: false,
    hasteHpct: false,
    mastery: true, // Procs Gusts
    vers: false,
  },
  [SPELLS.WHISPERS_OF_SHAOHAO.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false, // Procs Gusts
    vers: true,
  },


  /*
LIFE_COCOON
REVIVAL
SOOTHING_MIST
CRANE_HEAL
REFRESHING_JADE_WIND_TALENT
BLESSINGS_OF_YULON
CELESTIAL_BREATH
MISTS_OF_SHEILUN
CHI_BOLT
TRANQUIL_MIST
*/

};
