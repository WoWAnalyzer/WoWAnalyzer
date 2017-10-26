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
  [SPELLS.JUDGMENT_OF_LIGHT_HEAL.id]: {
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
  [SPELLS.HOLY_PRISM_HEAL.id]: {
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
    mastery: false, // confirmed many times this doesn't scale with Mastery
    vers: true,
  },
  [SPELLS.LIGHTS_HAMMER_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpct: true,
    mastery: true,
    vers: true,
  },
  [SPELLS.LIGHTS_EMBRACE_HEALING.id]: { // Sea Star of the Depthmother
    int: false,
    crit: true,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.GUIDING_HAND.id]: { // The Deceiver's Grand Design
    int: false,
    crit: true,
    hasteHpct: true,
    mastery: false,
    vers: true,
  },
  [SPELLS.AURA_OF_SACRIFICE_HEAL.id]: {
    ignored: true, // I'd like this to be temporary but it's a hard problem to solve so this is probably going to stay for many code-years
    multiplier: true, // This multiplies heals and is inconsistent. Don't include in the value for rating per 1%
  },
  [SPELLS.LEECH.id]: { // procs a percent of all your healing, so we ignore for weights and total healing
    multiplier: true,
  },
  [SPELLS.VELENS_FUTURE_SIGHT.id]: { // while active procs from any healing, so we ignore for weights and total healing
    multiplier: true,
  },
  [SPELLS.OBSIDIAN_STONE_SPAULDERS_HEAL.id]: {
    ignored: true,
  },
  [SPELLS.BEACON_OF_LIGHT.id]: {
    // This gets special treatment with the `on_beacon_heal` event
    ignored: true,
  },
  [SPELLS.LAY_ON_HANDS.id]: {
    ignored: true,
  },
};

const mentioned = [];
export function getSpellInfo(id, name = null) {
  if (process.env.NODE_ENV === 'development') {
    if (!HEAL_INFO[id] && !mentioned.includes(id)) {
      console.warn(`Missing spell definition: ${id}: ${name}, assuming it's only affected by Versatility`);
      mentioned.push(id);
    }
  }

  return HEAL_INFO[id] || DEFAULT_INFO;
}
