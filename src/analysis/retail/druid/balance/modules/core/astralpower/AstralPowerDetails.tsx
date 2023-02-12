import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Panel } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import AstralPowerTracker from 'analysis/retail/druid/balance/modules/core/astralpower/AstralPowerTracker';

/**
 * Deals with tracking Astral Power overcap issues.
 *
 * TODO how should this info be displayed Dragonflight?
 */
class AstralPowerDetails extends Analyzer {
  static dependencies = {
    astralPowerTracker: AstralPowerTracker,
  };
  protected astralPowerTracker!: AstralPowerTracker;

  get wasted() {
    return this.astralPowerTracker.wasted || 0;
  }

  get total() {
    return this.astralPowerTracker.wasted + this.astralPowerTracker.generated || 0;
  }

  get wastedPercent() {
    return this.wasted / this.total || 0;
  }

  // TODO alter stat to show specifically wasted during Eclipse?
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="small"
        tooltip={`${this.wasted} out of ${this.total} Astral Power wasted.`}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.ASTRAL_POWER}
          value={`${formatPercentage(this.wastedPercent)} %`}
          label="Overcapped Astral Power"
        />
      </Statistic>
    );
  }

  tab() {
    return {
      title: 'Astral Power usage',
      url: 'astral-power-usage',
      render: () => (
        <Panel>
          <ResourceBreakdown tracker={this.astralPowerTracker} showSpenders scaleFactor={0.1} />
        </Panel>
      ),
    };
  }
}

export default AstralPowerDetails;
