import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import UptimeMultiBarStatistic from 'parser/ui/UptimeMultiBarStatistic';

import Efflorescence from 'analysis/retail/druid/restoration/modules/spells/Efflorescence';
import Lifebloom from 'analysis/retail/druid/restoration/modules/spells/Lifebloom';

/**
 * Holder box for displaying lifebloom and efflo uptime together
 */
class LifebloomAndEffloUptime extends Analyzer {
  static dependencies = {
    lifebloom: Lifebloom,
    efflorescence: Efflorescence,
  };
  protected lifebloom!: Lifebloom;
  protected efflorescence!: Efflorescence;

  statistic() {
    return (
      <UptimeMultiBarStatistic
        title={
          <>
            <UptimeIcon /> Uptimes
          </>
        }
        position={STATISTIC_ORDER.CORE(9.5)} // chosen for fixed ordering of general stats
      >
        {this.lifebloom.subStatistic()}
        {this.efflorescence.subStatistic()}
      </UptimeMultiBarStatistic>
    );
  }
}

export default LifebloomAndEffloUptime;
