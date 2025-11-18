import { formatNumber, formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer from 'parser/core/Analyzer';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Panel from 'parser/ui/Panel';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import HolyPowerTracker from './HolyPowerTracker';
import { ThresholdStyle } from 'parser/core/ParseResults';

class HolyPowerDetails extends Analyzer {
  static dependencies = {
    holyPowerTracker: HolyPowerTracker,
  };

  protected holyPowerTracker!: HolyPowerTracker;

  get wastedHolyPowerPercent() {
    return (
      this.holyPowerTracker.wasted /
      (this.holyPowerTracker.wasted + this.holyPowerTracker.generated)
    );
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.wastedHolyPowerPercent,
      isLessThan: {
        minor: 0.98,
        average: 0.95,
        major: 0.92,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return [
      <Statistic
        key="Statistic"
        size="small"
        position={STATISTIC_ORDER.CORE(20)}
        tooltip={`${formatPercentage(this.wastedHolyPowerPercent)}% wasted`}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.HOLY_POWER}
          value={formatNumber(this.holyPowerTracker.wasted)}
          label="Holy Power Wasted"
        />
      </Statistic>,
      <Panel key="Panel" title="Holy power usage" pad={false} position={120}>
        <ResourceBreakdown tracker={this.holyPowerTracker} showSpenders />
      </Panel>,
    ];
  }
}

export default HolyPowerDetails;
