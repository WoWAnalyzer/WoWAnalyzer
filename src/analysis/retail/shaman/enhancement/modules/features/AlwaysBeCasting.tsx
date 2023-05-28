import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_SHAMAN } from 'common/TALENTS';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  position = STATISTIC_ORDER.CORE(1);

  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.125,
        average: 0.175,
        major: 0.225,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    const boss = this.owner.boss;
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage)
      .isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay
            between casting spells. Even if you have to move, try casting something instant with
            range like <SpellLink id={SPELLS.FLAME_SHOCK.id} />,{' '}
            <SpellLink id={TALENTS_SHAMAN.FROST_SHOCK_TALENT.id} />, or instant{' '}
            <SpellLink id={SPELLS.LIGHTNING_BOLT.id} />/
            <SpellLink id={TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT.id} />
          </span>,
        )
          .icon('spell_mage_altertime')
          .actual(
            t({
              id: 'shaman.enhancement.suggestions.alwaysBeCasting.downtime',
              message: `${formatPercentage(actual)}% downtime`,
            }),
          )
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15)
          .major(recommended + 0.2),
      );

    if (!boss || !boss.fight.disableDowntimeSuggestion) {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay
            between casting spells. Even if you have to move, try casting something instant with
            range like <SpellLink id={SPELLS.FLAME_SHOCK.id} />,{' '}
            <SpellLink id={TALENTS_SHAMAN.FROST_SHOCK_TALENT.id} />, or instant{' '}
            <SpellLink id={SPELLS.LIGHTNING_BOLT.id} />/
            <SpellLink id={TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT.id} />
          </span>,
        )
          .icon('spell_mage_altertime')
          .actual(
            t({
              id: 'shaman.enhancement.suggestions.alwaysBeCasting.downtime',
              message: `${formatPercentage(actual)}% downtime`,
            }),
          )
          .recommended(`<${formatPercentage(recommended)}% is recommended`),
      );
    }
  }
}

export default AlwaysBeCasting;
