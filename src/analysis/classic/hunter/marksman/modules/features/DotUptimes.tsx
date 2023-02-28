import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import SerpentSting from '../spells/SerpentSting';

class DotUptimeStatisticBox extends Analyzer {
  static dependencies = {
    serpentStingUptime: SerpentSting,
  };
  protected serpentStingUptime!: SerpentSting;

  statistic() {
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        {this.serpentStingUptime.subStatistic()}
      </StatisticBar>
    );
  }
}

export default DotUptimeStatisticBox;
