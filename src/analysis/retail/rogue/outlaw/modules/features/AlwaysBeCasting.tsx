import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    //TODO Varied for SnD and RtB?
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.25,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    const boss = this.owner.boss;

    if (!boss || !boss.fight.disableDeathSuggestion) {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay
            between casting spells. If everything is on cooldown, try and use{' '}
            <SpellLink id={SPELLS.SINISTER_STRIKE.id} /> to stay off the energy cap and do some
            damage.
          </span>,
        )
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`),
      );
    }
  }
}

export default AlwaysBeCasting;
