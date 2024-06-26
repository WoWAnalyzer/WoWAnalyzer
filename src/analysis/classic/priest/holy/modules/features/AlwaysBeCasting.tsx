import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { When } from 'parser/core/ParseResults';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import SPELLS from 'common/SPELLS/classic';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD: number[] = [
    // List of healing spells on GCD
    SPELLS.RENEW.id,
    SPELLS.CIRCLE_OF_HEALING.id,
    SPELLS.PRAYER_OF_MENDING.id,
    SPELLS.PRAYER_OF_HEALING.id,
    SPELLS.FLASH_HEAL.id,
    SPELLS.FLASH_HEAL_SURGE_OF_LIGHT.id,
    SPELLS.HEAL.id,
    SPELLS.DIVINE_HYMN.id,
    SPELLS.HOLY_WORD_SANCTUARY.id,
    SPELLS.HOLY_WORD_SERENITY.id,
    SPELLS.LIGHTWELL.id,
  ];

  suggestions(when: When) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage)
      .isGreaterThan(0.25)
      .addSuggestion((suggest, actual, recommended) =>
        suggest('Your downtime can be improved. Try to Always Be Casting (ABC).')
          .icon('spell_mage_altertime')
          .actual(
            defineMessage({
              id: 'shared.suggestions.alwaysBeCasting.downtime',
              message: `${formatPercentage(actual)}% downtime`,
            }),
          )
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05)
          .major(recommended + 0.05),
      );
  }
}

export default AlwaysBeCasting;
