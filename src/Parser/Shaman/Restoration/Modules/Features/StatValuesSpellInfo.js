import SPELLS from 'common/SPELLS';

/*
 * Fields:
 * int: spell scales with Intellect
 * crit: spell scales with Critical Strike
 * hasteHpm: spell does more healing due to Haste, e.g. Spells and Totems that gain more ticks
 * hasteHpct: spell can be cast more frequently due to Haste
 * mastery: spell is boosted by Mastery
 * vers: spell scales with Versatility
 * multiplier: spell scales with whatever procs it, should be ignored for purpose of weights and for 'total healing' number
 * ignored: spell should be ignored for purpose of stat weights
 */

// This only works with actual healing events; casts are not recognized.

export default {
  [SPELLS.HEALING_SURGE_RESTORATION.id]: {
    int: true,
    crit: true,
    hasteHpct: true,
    mastery: true,
    vers: true,
  },
  [SPELLS.HEALING_WAVE.id]: {
    int: true,
    crit: true,
    hasteHpct: true,
    mastery: true,
    vers: true,
  },
  [SPELLS.RIPTIDE.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: false, // static CD
    mastery: true,
    vers: true,
  },
  [SPELLS.HEALING_STREAM_TOTEM_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: false, // static CD
    mastery: true,
    vers: true,
  },
  [SPELLS.CHAIN_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpct: true,
    mastery: true,
    vers: true,
  },
  [SPELLS.HEALING_RAIN_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: false, // static CD
    mastery: true,
    vers: true,
  },
  [SPELLS.HEALING_TIDE_TOTEM_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: false, // static CD
    mastery: true,
    vers: true,
  },
  [SPELLS.ASCENDANCE_HEAL.id]: {
    // This gets special treatment with the `feed_heal` event
    ignored: true,
  },
  [SPELLS.CLOUDBURST_TOTEM_HEAL.id]: {
    // This gets special treatment with the `feed_heal` event
    ignored: true,
  },
  [SPELLS.EARTHEN_SHIELD_TOTEM_ABSORB.id]: {
    // EST scales with INT per hit but the total absorb is limited by the players max HP
    ignored: true,
  },
  [SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id]: {
    ignored: true,
  },
  [SPELLS.SPIRIT_LINK_TOTEM.id]: {
    ignored: true,
  },
  [SPELLS.UNLEASH_LIFE_TALENT.id]: {
    int: true,
    crit: true,
    hasteHpct: false, // static CD
    mastery: true,
    vers: true,
  },
  [SPELLS.WELLSPRING_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpct: false, // static CD
    mastery: true,
    vers: true,
  },
  [SPELLS.EARTH_SHIELD_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpct: false,
    mastery: true,
    vers: true,
  },
  [SPELLS.NATURES_GUARDIAN_HEAL.id]: {
    ignored: true, //probably only scales with HP
  },
  [SPELLS.RAINFALL.id]: {
    // T21 2pc
    int: true,
    crit: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.DOWNPOUR.id]: {
    // T21 4pc
    crit: true,
    vers: true,
  },
  [SPELLS.DOWNPOUR_TALENT.id]: {
    int: true,
    crit: true, 
    hasteHpct: false, // static CD
    mastery: false, // hopefully an error
    vers: true,
  },
};
