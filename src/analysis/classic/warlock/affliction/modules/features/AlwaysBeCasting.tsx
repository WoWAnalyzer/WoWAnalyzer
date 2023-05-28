import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/warlock';
import { SpellLink } from 'interface';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import Gauge from 'parser/ui/Gauge';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  position = STATISTIC_ORDER.CORE(6);

  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.15,
        major: 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.downtimeSuggestionThresholds)
      .isGreaterThan(0.15)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <>
            Your downtime can be improved. Try to Always Be Casting (ABC) by reducing your delay
            between casting spells. If you have to move, use instant cast spells (dots or{' '}
            <SpellLink id={SPELLS.LIFE_TAP} />
            ). Make good use of your <SpellLink id={SPELLS.DEMONIC_CIRCLE_SUMMON} /> when possible.
          </>,
        )
          .icon('spell_mage_altertime')
          .actual(
            t({
              id: 'warlock.affliction.suggestions.alwaysBeCasting.downtime',
              message: `${formatPercentage(actual)}% downtime`,
            }),
          )
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15)
          .major(recommended + 0.2),
      );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        tooltip={
          <>
            Downtime is available time not used to cast anything (including not having your GCD
            rolling). This can be caused by delays between casting spells, latency, cast
            interrupting, or not casting anything maybe due to movement or being stunned.
            <br />
            <ul>
              <li>
                You spent <strong>{formatPercentage(this.activeTimePercentage)}%</strong> of your
                time casting something.
              </li>
              <li>
                You spent <strong>{formatPercentage(this.downtimePercentage)}%</strong> of your time
                casting nothing at all.
              </li>
            </ul>
          </>
        }
      >
        <div className="pad">
          <label>Active time</label>
          <Gauge value={this.activeTimePercentage} />
        </div>
      </Statistic>
    );
  }
}

export default AlwaysBeCasting;
