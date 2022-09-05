import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { When } from 'parser/core/ParseResults';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  HEALING_ABILITIES_ON_GCD = [
    SPELLS.GREATER_HEAL.id,
    SPELLS.FLASH_HEAL.id,
    SPELLS.PRAYER_OF_MENDING_CAST.id,
    SPELLS.PRAYER_OF_HEALING.id,
    SPELLS.RENEW.id,
    SPELLS.HOLY_WORD_SERENITY.id,
    SPELLS.HOLY_WORD_SANCTIFY.id,
    SPELLS.BINDING_HEALS_TALENT.id,
    SPELLS.CIRCLE_OF_HEALING_TALENT.id,
    SPELLS.HALO_TALENT.id,
    SPELLS.DIVINE_STAR_TALENT.id,
    SPELLS.APOTHEOSIS_TALENT.id,
    SPELLS.DIVINE_HYMN_CAST.id,
    SPELLS.HOLY_WORD_SALVATION_TALENT.id,
  ];

  suggestions(when: When) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage)
      .isGreaterThan(0.15)
      .addSuggestion((suggest, actual, recommended) =>
        suggest('Your downtime can be improved. Try to Always Be Casting (ABC).')
          .icon('spell_mage_altertime')
          .actual(
            t({
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
