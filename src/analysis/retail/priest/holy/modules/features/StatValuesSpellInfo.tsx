import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';

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

/* Holy is a bit of a special child for mastery. Our mastery is it's own event, so for the sake of this module,
 * the only spell that "benefits" from our mastery is our mastery. It seems counter intuitive, but this is an
 * easy way to build out this module without a bunch of custom code for holy priests. Mastery doesn't *actually*
 * get any additional healing from int, crit, ect, but the amount of mastery generated is directly bound to those
 * stats, so they are all set to true here. */
export default {
  // Mastery
  [SPELLS.ECHO_OF_LIGHT_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: true,
    vers: true,
  },

  // Spells
  [SPELLS.HOLY_NOVA_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.GREATER_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.FLASH_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.PRAYER_OF_MENDING_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [TALENTS.PRAYER_OF_HEALING_TALENT.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [TALENTS.RENEW_TALENT.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [TALENTS.HOLY_WORD_SERENITY_TALENT.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [TALENTS.HOLY_WORD_SANCTIFY_TALENT.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.DESPERATE_PRAYER.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.GUARDIAN_SPIRIT_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.TRAIL_OF_LIGHT_TALENT_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.COSMIC_RIPPLE_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.DIVINE_HYMN_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },

  // Talents
  [SPELLS.BINDING_HEALS_TALENT_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [TALENTS.CIRCLE_OF_HEALING_TALENT.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [TALENTS.HOLY_WORD_SALVATION_TALENT.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.HALO_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.DIVINE_STAR_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
};
