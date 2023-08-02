import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/paladin';
import { SpellLink } from 'interface';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.15,
        average: 0.25,
        major: 0.35,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    const boss = this.owner.boss;

    if (!boss || !boss.fight.disableDowntimeSuggestion) {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <>
            Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay
            between casting spells. Even if you have to move, try casting something instant with
            range like <SpellLink spell={SPELLS.JUDGMENT_CAST} icon /> or{' '}
            <SpellLink spell={SPELLS.BLADE_OF_JUSTICE} icon />.
          </>,
        )
          .icon('spell_mage_altertime')
          .actual(
            defineMessage({
              id: 'paladin.retribution.alwaysBeCasting.downtime',
              message: `${formatPercentage(actual)}% downtime`,
            }),
          )
          .recommended(`<${formatPercentage(recommended)}% is recommended`),
      );
    }
  }

  static icons = {
    activeTime: '/img/wheelchair.png',
    downtime: '/img/afk.png',
  };
  position = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
