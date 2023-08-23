import { defineMessage } from '@lingui/macro';
import { RAGE_SCALE_FACTOR } from 'analysis/retail/warrior/constants';
import { formatNumber, formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Panel } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import RageGraph from './RageGraph';
import RageTracker from './RageTracker';

class RageDetails extends Analyzer {
  static dependencies = {
    rageTracker: RageTracker,
    rageGraph: RageGraph,
  };

  protected rageTracker!: RageTracker;
  protected rageGraph!: RageGraph;

  get wastedPercent() {
    return this.rageTracker.wasted / (this.rageTracker.wasted + this.rageTracker.generated) || 0;
  }

  get efficiencySuggestionThresholds() {
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

  get suggestionThresholds() {
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
      suggest(`You wasted ${formatPercentage(this.wastedPercent)}% of your Rage.`)
        .icon('spell_nature_reincarnation')
        .actual(
          defineMessage({
            id: 'warrior.fury.suggestions.rage.wasted',
            message: `${formatPercentage(actual)}% wasted`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={`${formatNumber(this.rageTracker.wasted)} out of ${formatNumber(
          this.rageTracker.wasted + this.rageTracker.generated,
        )} Rage wasted.`}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.RAGE}
          value={`${formatPercentage(this.wastedPercent)} %`}
          label="Rage wasted"
        />
      </Statistic>
    );
  }

  tab() {
    return {
      title: 'Rage usage',
      url: 'rage-usage',
      render: () => (
        <>
          <Panel title="Rage over time">{this.rageGraph.plot}</Panel>
          <Panel title="Breakdown">
            <ResourceBreakdown
              tracker={this.rageTracker}
              showSpenders
              scaleFactor={RAGE_SCALE_FACTOR}
            />
          </Panel>
        </>
      ),
    };
  }
}

export default RageDetails;
