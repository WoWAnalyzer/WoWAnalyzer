import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.35,
        major: 0.4,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const boss = this.owner.boss;

    if (!boss || !boss.fight.disableDowntimeSuggestion) {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <>
            Your downtime can be improved. Try to cast more, for example by reducing the delay
            between casting spells. Even if you have to move, try to cast something instant with
            range like <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon /> or{' '}
            <SpellLink id={TALENTS.AVENGERS_SHIELD_TALENT.id} icon />.
          </>,
        )
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`),
      );
    }
  }

  position = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
