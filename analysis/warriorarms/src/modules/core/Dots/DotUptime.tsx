import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import DeepWoundsUptime from './DeepWoundsUptime';
import RendUptime from './RendUptime';

class DotUptimeStatisticBox extends Analyzer {
  static dependencies = {
    deepwoundsUptime: DeepWoundsUptime,
    rendUptime: RendUptime,
  };

  protected deepwoundsUptime!: DeepWoundsUptime;
  protected rendUptime!: RendUptime;

  statistic() {
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(3)}>
        {this.deepwoundsUptime.subStatistic()}
        {this.rendUptime.active ? this.rendUptime.subStatistic() : null}
      </StatisticBar>
    );
  }
}

export default DotUptimeStatisticBox;
