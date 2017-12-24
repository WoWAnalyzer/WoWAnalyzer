import { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';

import SPELLS from 'common/SPELLS';

import CoreAlwaysBeCastingHealing from 'Parser/Core/Modules/AlwaysBeCastingHealing';

const HEALING_ABILITIES_ON_GCD = [
  SPELLS.GREATER_HEAL.id,
  SPELLS.FLASH_HEAL.id,
  SPELLS.PRAYER_OF_MENDING_CAST.id,
  SPELLS.PRAYER_OF_HEALING.id,
  SPELLS.RENEW.id,
  SPELLS.HOLY_WORD_SERENITY.id,
  SPELLS.HOLY_WORD_SANCTIFY.id,
  SPELLS.LIGHT_OF_TUURE_TRAIT.id,
  SPELLS.BINDING_HEAL_TALENT.id,
  SPELLS.CIRCLE_OF_HEALING_TALENT.id,
  SPELLS.HALO_TALENT.id,
  SPELLS.DIVINE_STAR_TALENT.id,
];

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD = HEALING_ABILITIES_ON_GCD;
  static ABILITIES_ON_GCD = [
    ...HEALING_ABILITIES_ON_GCD,
    SPELLS.FADE.id,
    SPELLS.ANGELIC_FEATHER_TALENT.id,
    SPELLS.BODY_AND_MIND_TALENT.id,
    SPELLS.SMITE.id,
    SPELLS.GUARDIAN_SPIRIT.id,
    SPELLS.DISPEL_MAGIC.id,
    SPELLS.LEAP_OF_FAITH.id,
    SPELLS.PURIFY.id,

    // DPS abilities that likely have no reason to be stored in SPELLS
    14915, // Holy Fire
    88625, // Holy Word: Chastise
    132157, // Holy Nova
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.15)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your downtime can be improved. Try to Always Be Casting (ABC).')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.05);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
