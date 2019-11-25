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

const DEFAULT_INFO = { // we assume unlisted spells scale with vers only (this will mostly be trinkets)
  int: false,
  crit: false,
  hasteHpm: false,
  hasteHpct: false,
  mastery: false,
  masteryStack: false,
  vers: true,
};

export const DRUID_HEAL_INFO = {
  [SPELLS.REJUVENATION.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: true,
    masteryStack: true,
    vers: true,
  },
  [SPELLS.REJUVENATION_GERMINATION.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: true,
    masteryStack: true,
    vers: true,
  },
  [SPELLS.REGROWTH.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: true,
    masteryStack: true,
    vers: true,
  },
  [SPELLS.WILD_GROWTH.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: false,
    mastery: true,
    masteryStack: true,
    vers: true,
  },
  [SPELLS.CULTIVATION.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true, // an approximation, because this is applied by Rejuv
    mastery: true,
    masteryStack: true,
    vers: true,
  },
  [SPELLS.SPRING_BLOSSOMS.id]: {
    int: true,
    crit: true,
    hasteHpm: true, // an approximation, because faster ticking Efflo will apply more
    hasteHpct: false,
    mastery: true,
    masteryStack: true,
    vers: true,
  },
  [SPELLS.CENARION_WARD_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: false,
    mastery: true,
    masteryStack: true,
    vers: true,
  },
  [SPELLS.FRENZIED_REGENERATION.id]: { // it's weird this scles with anything, but confirmed on live that it does
    int: false,
    crit: false,
    hasteHpm: false,
    hasteHpct: false,
    mastery: true,
    masteryStack: true,
    vers: true,
  },
  [SPELLS.LIFEBLOOM_HOT_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: false,
    mastery: true,
    masteryStack: true,
    vers: true,
  },
  [SPELLS.LIFEBLOOM_BLOOM_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: false,
    mastery: true,
    masteryStack: false,
    vers: true,
  },
  [SPELLS.SWIFTMEND.id]: {
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: false,
    mastery: true,
    masteryStack: false,
    vers: true,
  },
  [SPELLS.TRANQUILITY_HEAL.id]: {
    ignored: false, // Have to enable this again because of the changes to Tranq including a HoT part.
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: false,
    mastery: true,
    masteryStack: true,
    vers: true,
  },
  [SPELLS.EFFLORESCENCE_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: false,
    mastery: true,
    masteryStack: false,
    vers: true,
  },
  [SPELLS.YSERAS_GIFT_OTHERS.id]: { // TODO does it really scale with nothing (except stam)?
    int: false,
    crit: false,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    masteryStack: false,
    vers: false,
  },
  [SPELLS.YSERAS_GIFT_SELF.id]: { // TODO does it really scale with nothing (except stam)?
    int: false,
    crit: false,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    masteryStack: false,
    vers: false,
  },
  [SPELLS.RENEWAL_TALENT.id]: { // TODO does it really scale with nothing (except stam)?
    int: false,
    crit: false,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    masteryStack: false,
    vers: false,
  },
  [SPELLS.MARK_OF_SHIFTING.id]: { // TODO does it really scale with nothing (except stam)?
    int: false,
    crit: false,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    masteryStack: false,
    vers: false,
  },
  [SPELLS.AUTUMN_LEAVES.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: true,
    mastery: true,
    masteryStack: false,
    vers: true,
  },
  [SPELLS.BRACING_CHILL_HEAL.id]: { //TODO Double check
    int: true,
    crit: true,
    hasteHpm: false,
    hasteHpct: false,
    mastery: true,
    masteryStack: false,
    vers: true,
  },
  [SPELLS.GROVE_TENDING.id]: { //TODO Double check
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: false,
    mastery: true,
    masteryStack: true,
    vers: true,
  },
  // TODO - blazyb add all bfa specific spells of interest
};

export const getSpellInfo = id => {
  return DRUID_HEAL_INFO[id] || DEFAULT_INFO;
};
