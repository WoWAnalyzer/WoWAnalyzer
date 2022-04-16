import { formatNumber } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer from 'parser/core/Analyzer';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import HolyPowerTracker from './HolyPowerTracker';

class HolyPowerPerMinute extends Analyzer {
  static dependencies = {
    holyPowerTracker: HolyPowerTracker,
  };
  holyPowerTracker!: HolyPowerTracker;

  get HopoPerMin() {
    return this.owner.getPerMinute(this.holyPowerTracker.generated);
  }

  statistic() {
    return (
      <Statistic
        key="Statistic"
        size="small"
        position={STATISTIC_ORDER.CORE(20)}
        tooltip={`${formatNumber(this.holyPowerTracker.generated)} Total Holy Power Generated`}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.HOLY_POWER}
          value={formatNumber(this.HopoPerMin)}
          label="Holy Power Generated Per Minute"
        />
      </Statistic>
    );
  }
}

export default HolyPowerPerMinute;
