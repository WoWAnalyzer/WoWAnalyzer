import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Panel } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import {
  RESOURCES_HUNTER_AVERAGE_THRESHOLD,
  RESOURCES_HUNTER_MAJOR_THRESHOLD,
  RESOURCES_HUNTER_MINOR_THRESHOLD,
} from './constants';
import FocusTracker from './FocusTracker';

class FocusDetails extends Analyzer {
  static dependencies = {
    focusTracker: FocusTracker,
  };

  protected focusTracker!: FocusTracker;

  get wasted() {
    return this.focusTracker.wasted || 0;
  }

  get total() {
    return this.focusTracker.wasted + this.focusTracker.generated || 0;
  }

  get wastedPercent() {
    return this.wasted / this.total || 0;
  }

  get focusGeneratorWasteThresholds() {
    return {
      actual: 1 - this.wastedPercent,
      isLessThan: {
        minor: 1 - RESOURCES_HUNTER_MINOR_THRESHOLD,
        average: 1 - RESOURCES_HUNTER_AVERAGE_THRESHOLD,
        major: 1 - RESOURCES_HUNTER_MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(11)}
        size="flexible"
        tooltip={`You wasted ${this.wasted} out of ${this.total} Focus from generators.`}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.FOCUS}
          value={`${formatPercentage(this.wastedPercent)} %`}
          label="Wasted generator Focus"
        />
      </Statistic>
    );
  }

  tab() {
    return {
      title: 'Focus',
      url: 'focus',
      render: () => (
        <Panel>
          <ResourceBreakdown tracker={this.focusTracker} showSpenders />
        </Panel>
      ),
    };
  }
}

export default FocusDetails;
