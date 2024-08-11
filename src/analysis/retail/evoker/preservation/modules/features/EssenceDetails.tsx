import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer from 'parser/core/Analyzer';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import { Panel } from 'interface';
import { EssenceTracker } from 'analysis/retail/evoker/shared';

class EssenceDetails extends Analyzer {
  static dependencies = {
    essenceTracker: EssenceTracker,
  };
  protected essenceTracker!: EssenceTracker;

  get wasted() {
    return this.essenceTracker.rateWaste || 0;
  }

  get total() {
    return this.essenceTracker.rateWaste + this.essenceTracker.generated || 0;
  }

  get wastedPercent() {
    return this.wasted / this.total || 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="flexible"
        tooltip={`You lost ${this.wasted.toFixed(2)} essence from sitting at max resource`}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.ESSENCE}
          value={`${this.wasted.toFixed(2)} `}
          label="Overcapped Essence"
        />
      </Statistic>
    );
  }

  tab() {
    return {
      title: 'Essence Usage',
      url: 'essence-usage',
      render: () => (
        <Panel key="Panel" title="Essence Usage" pad={false}>
          <ResourceBreakdown tracker={this.essenceTracker} showSpenders hideGenerated />
        </Panel>
      ),
    };
  }
}

export default EssenceDetails;
