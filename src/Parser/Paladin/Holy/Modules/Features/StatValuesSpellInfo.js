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
    hasteHpct: false, // static CD
    mastery: true,
    vers: true,
  },
  [SPELLS.LIGHTS_HAMMER_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpct: false, // static CD
    mastery: true,
    vers: true,
  },
  [SPELLS.HOLY_PRISM_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpct: false, // static CD
    mastery: true,
    vers: true,
  },
  [SPELLS.TYRS_DELIVERANCE_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpct: false, // static CD
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
    hasteHpct: false,
    mastery: false, // confirmed many times this doesn't scale with Mastery
    vers: true,
  },
  [SPELLS.AURA_OF_SACRIFICE_HEAL.id]: {
    ignored: true, // I'd like this to be temporary but it's a hard problem to solve so this is probably going to stay for many code-years
    multiplier: true, // This multiplies heals and is inconsistent. Don't include in the value for rating per 1%
  },
  [SPELLS.AVENGING_CRUSADER_HEAL.id]: {
    int: true,
    crit: false, // https://cdn.discordapp.com/attachments/406441490533974017/434730955924832257/unknown.png based on only half the damage done
    hasteHpct: true,
    mastery: false, // it just raw scales off of the damage done
    vers: true,
  },
  [SPELLS.BEACON_OF_LIGHT_HEAL.id]: {
    // This gets special treatment with the `on_beacon_heal` event
    ignored: true,
  },
  [SPELLS.LAY_ON_HANDS.id]: {
    ignored: true,
  },
};
