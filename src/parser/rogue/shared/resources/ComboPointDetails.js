import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';
import ResourceBreakdown from 'parser/shared/modules/resourcetracker/ResourceBreakdown';

import ComboPointTracker from './ComboPointTracker';

const MINOR_THRESHOLD = 0.05;
const AVERAGE_THRESHOLD = 0.1;
const MAJOR_THRESHOLD = 0.2;

class ComboPointDetails extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };

  get wasted() {
    return this.comboPointTracker.wasted || 0;
  }

  get total() {
    return this.comboPointTracker.wasted + this.comboPointTracker.generated || 0;
  }

  get wastedPercent() {
    return this.wasted / this.total || 0;
  }

  get suggestionThresholds() {
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
      <StatisticBox
        position={STATISTIC_ORDER.CORE(3)}
        icon={<Icon icon="ability_rogue_masterofsubtlety" alt="Wasted Combo Points" />}
        value={`${formatPercentage(this.wastedPercent)} %`}
        label="Wasted Combo Points"
        tooltip={`You wasted ${this.wasted} out of ${this.total} Combo Points. Some waste is expected due to the random nature of some generation abilities.`}
      />
    );
  }

  tab() {
    return {
      title: 'Combo Point usage',
      url: 'combo-points',
      render: () => (
        <Panel>
          <ResourceBreakdown
            tracker={this.comboPointTracker}
            showSpenders
          />
        </Panel>
      ),
    };
 }
}

export default ComboPointDetails;
