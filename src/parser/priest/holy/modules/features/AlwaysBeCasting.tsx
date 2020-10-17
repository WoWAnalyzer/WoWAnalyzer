import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatPercentage } from 'common/format';

import SPELLS from 'common/SPELLS';

import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import { When } from 'parser/core/ParseResults';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD = [
    SPELLS.GREATER_HEAL.id,
    SPELLS.FLASH_HEAL.id,
    SPELLS.PRAYER_OF_MENDING_CAST.id,
    SPELLS.PRAYER_OF_HEALING.id,
    SPELLS.RENEW.id,
    SPELLS.HOLY_WORD_SERENITY.id,
    SPELLS.HOLY_WORD_SANCTIFY.id,
    SPELLS.BINDING_HEAL_TALENT.id,
    SPELLS.CIRCLE_OF_HEALING_TALENT.id,
    SPELLS.HALO_TALENT.id,
    SPELLS.DIVINE_STAR_TALENT.id,
    SPELLS.APOTHEOSIS_TALENT.id,
    SPELLS.DIVINE_HYMN_CAST.id,
    SPELLS.HOLY_WORD_SALVATION_TALENT.id,
  ];

  suggestions(when: When) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.15)
      .addSuggestion((suggest, actual, recommended) => suggest('Your downtime can be improved. Try to Always Be Casting (ABC).')
          .icon('spell_mage_altertime')
          .actual(i18n._(t('priest.holy.suggestions.alwaysBeCasting.downtime')`${formatPercentage(actual)}% downtime`))
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.05));
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
