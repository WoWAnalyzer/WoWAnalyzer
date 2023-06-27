import { formatPercentage } from 'common/format';
import { When } from 'parser/core/ParseResults';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import SPELLS from 'common/SPELLS/classic/druid';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD: number[] = [
    // List of healing spells on GCD
    SPELLS.HEALING_TOUCH.id,
    ...SPELLS.HEALING_TOUCH.lowRanks,
    SPELLS.LIFEBLOOM.id,
    ...SPELLS.LIFEBLOOM.lowRanks,
    SPELLS.NOURISH.id,
    SPELLS.REGROWTH.id,
    ...SPELLS.REGROWTH.lowRanks,
    SPELLS.REJUVENATION.id,
    ...SPELLS.REJUVENATION.lowRanks,
    SPELLS.SWIFTMEND.id,
    SPELLS.TRANQUILITY.id,
    ...SPELLS.TRANQUILITY.lowRanks,
    SPELLS.WILD_GROWTH.id,
    ...SPELLS.WILD_GROWTH.lowRanks,
  ];

  suggestions(when: When) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage)
      .isGreaterThan(0.25)
      .addSuggestion((suggest, actual, recommended) =>
        suggest('Your downtime can be improved. Try to Always Be Casting (ABC).')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05)
          .major(recommended + 0.05),
      );
  }
}

export default AlwaysBeCasting;
