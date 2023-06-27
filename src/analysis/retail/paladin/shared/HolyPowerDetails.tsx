import { formatNumber, formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer from 'parser/core/Analyzer';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Panel from 'parser/ui/Panel';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import HolyPowerTracker from './HolyPowerTracker';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const holyPowerIcon = 'inv_helmet_96';

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

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(`You wasted ${formatNumber(this.holyPowerTracker.wasted)} Holy Power.`)
        .icon(holyPowerIcon)
        .actual(`${formatPercentage(this.wastedHolyPowerPercent)}% Holy Power wasted`)
        .recommended(`Wasting <${formatPercentage(1 - recommended)}% is recommended`),
    );
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
