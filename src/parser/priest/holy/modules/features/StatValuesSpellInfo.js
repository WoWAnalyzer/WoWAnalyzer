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
  // Mastery
  [SPELLS.ECHO_OF_LIGHT_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: true, //Procs Gusts
    vers: true,
  },

  // Spells
  [SPELLS.HOLY_NOVA_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.GREATER_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.FLASH_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.PRAYER_OF_MENDING_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.PRAYER_OF_HEALING.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.RENEW.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.HOLY_WORD_SERENITY.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.HOLY_WORD_SANCTIFY.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.DESPERATE_PRAYER.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.GUARDIAN_SPIRIT_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.TRAIL_OF_LIGHT_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.COSMIC_RIPPLE_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.DIVINE_HYMN_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },

  // Talents
  [SPELLS.BINDING_HEAL_TALENT.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.CIRCLE_OF_HEALING_TALENT.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.HOLY_WORD_SALVATION_TALENT.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.HALO_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.DIVINE_STAR_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },

  // Azerite Traits
  [SPELLS.SAVIOR_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false, //Procs Gusts
    vers: true,
  },
  [SPELLS.CONCENTRATED_MENDING_HEALING.id]: { // Healing Azerite Power
    int: false,
    crit: true,
    hasteHpm: true,
    mastery: false, // Overwriting base value.
    vers: true,
  },
};
