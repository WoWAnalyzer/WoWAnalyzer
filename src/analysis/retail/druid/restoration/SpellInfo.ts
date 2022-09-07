import SPELLS from 'common/SPELLS';
import { ListOfHealerSpellInfo } from 'parser/shared/modules/features/BaseHealerStatValues';

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

const DEFAULT_INFO = {
  // we assume unlisted spells scale with vers only (this will mostly be trinkets)
  int: false,
  crit: false,
  hasteHpm: false,
  hasteHpct: false,
  mastery: false,
  masteryStack: false,
  vers: true,
};

export const DRUID_HEAL_INFO: ListOfHealerSpellInfo = {
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
  [SPELLS.FRENZIED_REGENERATION.id]: {
    // it's weird this scles with anything, but confirmed on live that it does
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
  [SPELLS.LIFEBLOOM_DTL_HOT_HEAL.id]: {
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
  [SPELLS.ADAPTIVE_SWARM_HEAL.id]: {
    int: true,
    crit: true,
    hasteHpm: true,
    hasteHpct: false,
    mastery: true,
    masteryStack: true,
    vers: true,
  },
  [SPELLS.YSERAS_GIFT_OTHERS.id]: {
    // TODO does it really scale with nothing (except stam)?
    int: false,
    crit: false,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    masteryStack: false,
    vers: false,
  },
  [SPELLS.YSERAS_GIFT_SELF.id]: {
    // TODO does it really scale with nothing (except stam)?
    int: false,
    crit: false,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    masteryStack: false,
    vers: false,
  },
  [SPELLS.RENEWAL_TALENT.id]: {
    int: false,
    crit: false,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    masteryStack: false,
    vers: false,
  },
  [SPELLS.RENEWING_BLOOM.id]: {
    int: true,
    crit: true,
    hasteHpm: true, // TODO double check this
    hasteHpct: false,
    mastery: true,
    masteryStack: true,
    vers: true,
  },
};

/** Gets the SpellInfo object for a spell with the given ID */
export const getSpellInfo = (id: number) => DRUID_HEAL_INFO[id] || DEFAULT_INFO;
