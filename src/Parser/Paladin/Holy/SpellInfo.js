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

export const HEAL_INFO = {
  [SPELLS.HOLY_SHOCK_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpct: true,
    mastery: true,
    vers: true,
  },
  [SPELLS.LIGHT_OF_DAWN_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpct: true,
    mastery: true,
    vers: true,
  },
  [SPELLS.JUDGMENT_OF_LIGHT_TALENT.id]: {
    int: true,
    crit: true,
    hasteHpct: true,
    mastery: true,
    vers: true,
  },
  [SPELLS.BESTOW_FAITH_TALENT.id]: {
    int: true,
    crit: true,
    hasteHpct: false,
    mastery: true,
    vers: true,
  },
  [SPELLS.LIGHTS_HAMMER_TALENT.id]: {
    int: true,
    crit: true,
    hasteHpct: true,
    mastery: true,
    vers: true,
  },
  [SPELLS.HOLY_PRISM_TALENT.id]: {
    int: true,
    crit: true,
    hasteHpct: true,
    mastery: true,
    vers: true,
  },
  [SPELLS.TYRS_DELIVERANCE_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpct: true,
    mastery: true,
    vers: true,
  },
  [SPELLS.LIGHT_OF_THE_MARTYR.id]: {
    int: true,
    crit: true,
    hasteHpct: true,
    mastery: true,
    vers: true,
  },
  [SPELLS.FLASH_OF_LIGHT.id]: {
    int: true,
    crit: true,
    hasteHpct: true,
    mastery: true,
    vers: true,
  },
  [SPELLS.HOLY_LIGHT.id]: {
    int: true,
    crit: true,
    hasteHpct: true,
    mastery: true,
    vers: true,
  },
  [SPELLS.AURA_OF_MERCY_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.AURA_OF_SACRIFICE_HEAL.id]: {
    multiplier: true, // I'd like this to be temporary but it's a super hard problem to solve so this is probably going to stay for years
  },
  [SPELLS.LEECH.id]: { // procs a percent of all your healing, so we ignore for weights and total healing
    multiplier: true,
  },
  [SPELLS.VELENS_FUTURE_SIGHT.id]: { // while active procs from any healing, so we ignore for weights and total healing
    multiplier: true,
  },
};

export const getSpellInfo = id => {
  return HEAL_INFO[id] || DEFAULT_INFO;
};
