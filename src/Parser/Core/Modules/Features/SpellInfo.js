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
  [SPELLS.HEALTHSTONE.id]: {
    int: false,
    crit: false,
    hasteHpct: false,
    mastery: false,
    vers: false, // not 100% sure
  },
  [SPELLS.MARK_OF_THE_ANCIENT_PRIESTESS.id]: {
    int: false,
    crit: true,
    hasteHpct: false,
    mastery: false,
    vers: true,
  },
};
