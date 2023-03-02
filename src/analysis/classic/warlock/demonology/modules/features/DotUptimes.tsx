import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import Corruption from '../spells/Corruption';
import Immolate from '../spells/Immolate';
import ShadowMastery from '../spells/ShadowMastery';

class DotUptimeStatisticBox extends Analyzer {
  static dependencies = {
    corruptionUptime: Corruption,
    immolateUptime: Immolate,
    shadowMasteryUptime: ShadowMastery,
  };
  protected corruptionUptime!: Corruption;
  protected immolateUptime!: Immolate;
  protected shadowMasteryUptime!: ShadowMastery;

  statistic() {
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        {this.corruptionUptime.subStatistic()}
        {this.immolateUptime.subStatistic()}
        {this.shadowMasteryUptime.subStatistic()}
      </StatisticBar>
    );
  }
}

export default DotUptimeStatisticBox;
