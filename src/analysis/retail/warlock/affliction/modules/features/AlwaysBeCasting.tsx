import { formatPercentage } from 'common/format';
import { ThresholdStyle } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import Gauge from 'parser/ui/Gauge';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  position = STATISTIC_ORDER.CORE(6);

  get suggestionThresholds() {
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

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        tooltip={
          <>
            Downtime is available time not used to cast anything (including not having your GCD
            rolling). This can be caused by delays between casting spells, latency, cast
            interrupting or just simply not casting anything (e.g. due to movement/stunned).
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
