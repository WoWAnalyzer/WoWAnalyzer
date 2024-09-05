import RageGraph from 'analysis/retail/warrior/shared/modules/core/RageGraph';
import { formatNumber, formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Panel } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import RageTracker from './RageTracker';

class WarriorRageDetails extends Analyzer.withDependencies({
  rageTracker: RageTracker,
  rageGraph: RageGraph,
}) {
  protected get wastedPercent() {
    return (
      this.deps.rageTracker.wasted /
        (this.deps.rageTracker.wasted + this.deps.rageTracker.generated) || 0
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={`${formatNumber(this.deps.rageTracker.wasted)} out of ${formatNumber(
          this.deps.rageTracker.wasted + this.deps.rageTracker.generated,
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
          <Panel title="Rage over time">{this.deps.rageGraph.plot}</Panel>
          <Panel title="Breakdown">
            <ResourceBreakdown tracker={this.deps.rageTracker} showSpenders />
          </Panel>
        </>
      ),
    };
  }
}

export default WarriorRageDetails;
