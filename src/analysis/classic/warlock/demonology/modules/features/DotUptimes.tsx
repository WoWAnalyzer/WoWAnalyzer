import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import Corruption from '../spells/Corruption';
import Immolate from '../spells/Immolate';

class DotUptimeStatisticBox extends Analyzer {
  static dependencies = {
    corruptionUptime: Corruption,
    immolateUptime: Immolate,
  };
  protected corruptionUptime!: Corruption;
  protected immolateUptime!: Immolate;

  statistic() {
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        {this.corruptionUptime.subStatistic()}
        {this.immolateUptime.subStatistic()}
      </StatisticBar>
    );
  }
}

export default DotUptimeStatisticBox;
