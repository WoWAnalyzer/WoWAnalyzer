import SPELLS from 'common/SPELLS';

/*
 * Fields:
 * int: spell scales with Intellect
 * crit: spell scales with (is able to or procced from) Critical Strike
 * hasteHpm: spell does more healing due to Haste, e.g. HoTs that gain more ticks
 * hasteHpct: spell can be cast more frequently due to Haste, basically any spell except for non haste scaling CDs
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
  [SPELLS.QUEENS_DECREE.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: false,
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
  [SPELLS.ANCESTRAL_GUIDANCE_HEAL.id]: {
    // This gets special treatment with the `on_feed_heal` event
    ignored: true,   
  },
  [SPELLS.ASCENDANCE_HEAL.id]: {
    // This gets special treatment with the `on_feed_heal` event
    ignored: true,
  },
  [SPELLS.CLOUDBURST_TOTEM_HEAL.id]: { 
    // This gets special treatment with the `on_feed_heal` event
    ignored: true,
  },
  [SPELLS.EARTHEN_SHIELD_TOTEM_ABSORB.id]: { 
    //it scales with INT per hit but the total absorb is limited by the players max HP
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
  [SPELLS.GIFT_OF_THE_QUEEN.id]: { 
    int: true,
    crit: true,
    hasteHpct: false, // static CD
    mastery: true,
    vers: true,
  },
  [SPELLS.GIFT_OF_THE_QUEEN_DUPLICATE.id]: { 
    int: true,
    crit: true,
    hasteHpct: false, // static CD
    mastery: true,
    vers: true,
  },
  [SPELLS.TIDAL_TOTEM.id]: { 
    int: true,
    crit: true,
    hasteHpm: true,
    mastery: true,
    vers: true,
  },
  [SPELLS.RAINFALL.id]: { // T21 2pc
    int: true,
    crit: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.DOWNPOUR.id]: { // T21 4pc double dipping
    crit: true,
    vers: true,
  },
  [SPELLS.ROOTS_OF_SHALADRASSIL_HEAL.id]: { // Roots
    ignored: true,
  },
};
