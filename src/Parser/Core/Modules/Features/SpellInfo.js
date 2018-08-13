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
  [SPELLS.OCEANS_EMBRACE.id]: { // Sea Star of the Depthmother
    int: false,
    crit: true,
    hasteHpct: true, // until LoD's CD is below 8 sec, this speeds up the deck cycle time
    mastery: false,
    vers: true,
  },
  [SPELLS.GUIDING_HAND.id]: { // The Deceiver's Grand Design
    int: false,
    crit: true,
    hasteHpct: false, // static CD
    hasteHpm: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.HIGHFATHERS_TIMEKEEPING_HEAL.id]: { // Highfather's Machination
    int: false,
    crit: true,
    hasteHpct: true,
    hasteHpm: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.LEECH.id]: { // procs a percent of all your healing, so we ignore for weights and total healing
    multiplier: true,
  },
  [SPELLS.VELENS_FUTURE_SIGHT_HEAL.id]: { // while active procs from any healing, so we ignore for weights and total healing
    multiplier: true,
  },
  [SPELLS.EONARS_COMPASSION_HEAL.id]: {
    int: false,
    crit: true,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.XAVARICS_MAGNUM_OPUS.id]: { // Prydaz
    int: false,
    crit: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.HEALTHSTONE.id]: {
    int: false,
    crit: false,
    hasteHpct: false,
    mastery: false,
    vers: true, // confirmed
  },
  [SPELLS.COASTAL_HEALING_POTION.id]: {
    int: false,
    crit: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.MARK_OF_THE_ANCIENT_PRIESTESS.id]: {
    int: false,
    crit: true,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },

  // https://www.warcraftlogs.com/reports/zxXDd7CJFbLQpHGM/#fight=12&source=3&type=summary
  [SPELLS.RESOUNDING_PROTECTION_ABSORB.id]: { // General Azerite Power
    int: false,
    crit: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.IMPASSIVE_VISAGE_HEAL.id]: {
    int: false,
    crit: true,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.VAMPIRIC_SPEED_HEAL.id]: { // General(?) Azerite trait
    int: false,
    crit: true,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.RADIANT_INCANDESCENCE.id]: { // Holy Paladin Azerite trait
    int: false,
    crit: true,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.REJUVENATING_TIDES.id]: { // Darkmoon Deck: Tides
    int: false,
    crit: true,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  [SPELLS.TOUCH_OF_THE_VOODOO.id]: { // Revitalizing Voodoo Totem
    int: false,
    crit: true,
    hasteHpct: false,
    hasteHpm: true,
    mastery: false,
    vers: true,
  },
  // https://www.warcraftlogs.com/reports/zxXDd7CJFbLQpHGM/#fight=12&source=3
  [SPELLS.CONCENTRATED_MENDING.id]: { // Healing Azerite Power
    int: false,
    crit: true,
    hasteHpct: true,
    mastery: true, // TODO: Re-evaluate, going on word of mouth and I have my doubts
    vers: true,
  },
  // https://www.warcraftlogs.com/reports/cXnPABVbLjk68qyM#fight=6&type=healing&source=10
  271682: { // Harmonious Chord - Lady Waycrest's Music Box (trinket)
    int: false,
    crit: true,
    hasteHpct: true,
    hasteHpm: false,
    mastery: false,
    vers: true,
  },
  // https://www.warcraftlogs.com/reports/cXnPABVbLjk68qyM#fight=6&type=healing&source=10&ability=267537&view=events
  267537: { // Coastal Surge (Weapon enchant)
    int: false,
    crit: true,
    hasteHpct: false, // TODO: Verify
    hasteHpm: true,
    mastery: false,
    vers: true,
  },
};
