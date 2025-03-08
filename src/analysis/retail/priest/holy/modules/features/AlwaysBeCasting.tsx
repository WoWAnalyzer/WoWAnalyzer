import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { When } from 'parser/core/ParseResults';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  HEALING_ABILITIES_ON_GCD = [
    SPELLS.GREATER_HEAL.id,
    SPELLS.FLASH_HEAL.id,
    TALENTS.PRAYER_OF_MENDING_TALENT.id,
    TALENTS.PRAYER_OF_HEALING_TALENT.id,
    TALENTS.RENEW_TALENT.id,
    TALENTS.HOLY_WORD_SERENITY_TALENT.id,
    TALENTS.HOLY_WORD_SANCTIFY_TALENT.id,
    TALENTS.HALO_SHARED_TALENT.id,
    TALENTS.DIVINE_STAR_SHARED_TALENT.id,
    TALENTS.APOTHEOSIS_TALENT.id,
    TALENTS.DIVINE_HYMN_TALENT.id,
  ];

  suggestions(when: When) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage)
      .isGreaterThan(0.15)
      .addSuggestion((suggest, actual, recommended) =>
        suggest('Your downtime can be improved. Try to Always Be Casting (ABC).')
          .icon('spell_mage_altertime')
          .actual(
            defineMessage({
              id: 'priest.holy.suggestions.alwaysBeCasting.downtime',
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
