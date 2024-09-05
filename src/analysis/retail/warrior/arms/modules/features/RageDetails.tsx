import { defineMessage } from '@lingui/macro';
import RageGraph from 'analysis/retail/warrior/shared/modules/core/RageGraph';
import RageTracker from 'analysis/retail/warrior/shared/modules/core/RageTracker';
import { formatPercentage } from 'common/format';
import { Panel } from 'interface';
import { Icon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class RageDetails extends Analyzer {
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
      style: 'percentage',
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
      style: 'percentage',
    };
  }

  static dependencies = {
    rageTracker: RageTracker,
    rageGraph: RageGraph,
  };

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(`You wasted ${formatPercentage(this.wastedPercent)}% of your Rage.`)
        .icon('spell_nature_reincarnation')
        .actual(
          defineMessage({
            id: 'warrior.arms.suggestions.rage.wasted',
            message: `${formatPercentage(actual)}% wasted`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        icon={<Icon icon="spell_nature_reincarnation" />}
        value={`${formatPercentage(this.wastedPercent)} %`}
        label="Rage wasted"
        tooltip={`${Math.round(this.rageTracker.wasted)} out of ${Math.round(
          this.rageTracker.wasted + this.rageTracker.generated,
        )} rage wasted.`}
      />
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
            <ResourceBreakdown tracker={this.rageTracker} showSpenders />
          </Panel>
        </>
      ),
    };
  }
}

export default RageDetails;
