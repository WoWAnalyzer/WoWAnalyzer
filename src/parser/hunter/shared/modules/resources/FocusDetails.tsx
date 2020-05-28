import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Statistic from 'interface/statistics/Statistic';
import { formatPercentage } from 'common/format';
import ResourceBreakdown from 'parser/shared/modules/resourcetracker/ResourceBreakdown';
import BoringResourceValue from 'interface/statistics/components/BoringResourceValue';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import FocusTracker from './FocusTracker';

const MINOR_THRESHOLD = 0.05;
const AVERAGE_THRESHOLD = 0.1;
const MAJOR_THRESHOLD = 0.15;

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
        minor: 1 - MINOR_THRESHOLD,
        average: 1 - AVERAGE_THRESHOLD,
        major: 1 - MAJOR_THRESHOLD,
      },
      style: 'percentage',
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(2)}
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
          <ResourceBreakdown
            tracker={this.focusTracker}
            showSpenders
          />
        </Panel>
      ),
    };
  }
}

export default FocusDetails;
