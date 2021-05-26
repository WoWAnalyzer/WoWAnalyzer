import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import UptimeMultiBarStatistic from 'parser/ui/UptimeMultiBarStatistic';
import React from 'react';

import Efflorescence from './Efflorescence';
import Lifebloom from './Lifebloom';

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
        position={STATISTIC_ORDER.CORE(9.5)}
      >
        {this.lifebloom.subStatistic()}
        {this.efflorescence.subStatistic()}
      </UptimeMultiBarStatistic>
    );
  }
}

export default LifebloomAndEffloUptime;
