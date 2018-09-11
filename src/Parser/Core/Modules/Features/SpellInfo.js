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
  [SPELLS.LEECH.id]: { // procs a percent of all your healing, so we ignore for weights and total healing
    multiplier: true,
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
  [SPELLS.STALWART_PROTECTOR.id]: { // General Paladin Azerite Power
    int: false,
    crit: false,
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
  // https://www.warcraftlogs.com/reports/axKCmGyfgXFw6QVL/#fight=28&source=156
  [SPELLS.BLESSED_PORTENTS.id]: { // General Azerite Power
    int: false,
    crit: true,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  // https://www.warcraftlogs.com/reports/axKCmGyfgXFw6QVL/#fight=28&source=156
  [SPELLS.BRACING_CHILL_HEAL.id]: { // General Azerite Power
    int: false,
    crit: true,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  // https://www.warcraftlogs.com/reports/fKaZdyWcQYAwTtz2/#fight=4&source=9&type=healing&options=8
  [SPELLS.AZERITE_FORTIFICATION.id]: { // General Azerite Power
    int: false,
    crit: true,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
  // https://www.warcraftlogs.com/reports/fKaZdyWcQYAwTtz2/#fight=4&source=9&type=healing&options=8
  [SPELLS.AZERITE_VEINS.id]: { // General Azerite Power
    int: false,
    crit: true,
    hasteHpct: true, // not sure
    mastery: false,
    vers: true,
  },
  // https://www.warcraftlogs.com/reports/fKaZdyWcQYAwTtz2/#fight=4&source=9&type=healing&options=8
  [SPELLS.SAVIOR.id]: { // General Azerite Power
    int: false,
    crit: true,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
};
