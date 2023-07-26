import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Panel } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import FuryTracker from './FuryTracker';

class FuryDetails extends Analyzer {
  static dependencies = {
    furyTracker: FuryTracker,
  };

  protected furyTracker!: FuryTracker;

  get wastedPercent() {
    return this.furyTracker.wasted / (this.furyTracker.wasted + this.furyTracker.generated) || 0;
  }

  get efficiencySuggestionThresholds(): NumberThreshold {
    return {
      actual: 1 - this.wastedPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholds(): NumberThreshold {
    return {
      actual: this.wastedPercent,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.15,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(`You wasted ${formatPercentage(this.wastedPercent)}% of your Fury.`)
        .icon('ability_demonhunter_demonspikes')
        .actual(
          defineMessage({
            id: 'demonhunter.vengeance.suggestions.fury.wasted',
            message: `${formatPercentage(actual)}% wasted`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="small"
        tooltip={`${this.furyTracker.wasted} out of ${
          this.furyTracker.wasted + this.furyTracker.generated
        } fury wasted.`}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.FURY}
          value={`${formatPercentage(this.wastedPercent)} %`}
          label="Fury wasted"
        />
      </Statistic>
    );
  }

  tab() {
    return {
      title: 'Fury Usage',
      url: 'fury-usage',
      render: () => (
        <Panel>
          <ResourceBreakdown tracker={this.furyTracker} showSpenders />
        </Panel>
      ),
    };
  }
}

export default FuryDetails;
