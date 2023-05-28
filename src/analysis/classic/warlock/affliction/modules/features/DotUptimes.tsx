import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import CurseOfAgony from '../spells/CurseOfAgony';
import Corruption from '../spells/Corruption';
import Haunt from '../spells/Haunt';
import UnstableAffliction from '../spells/UnstableAffliction';

class DotUptimeStatisticBox extends Analyzer {
  static dependencies = {
    agonyUptime: CurseOfAgony,
    corruptionUptime: Corruption,
    hauntUptime: Haunt,
    unstableAfflictionUptime: UnstableAffliction,
  };
  protected agonyUptime!: CurseOfAgony;
  protected corruptionUptime!: Corruption;
  protected hauntUptime!: Haunt;
  protected unstableAfflictionUptime!: UnstableAffliction;

  statistic() {
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        {this.agonyUptime.subStatistic()}
        {this.corruptionUptime.subStatistic()}
        {this.unstableAfflictionUptime.subStatistic()}
        {this.hauntUptime.active && this.hauntUptime.subStatistic()}
      </StatisticBar>
    );
  }
}

export default DotUptimeStatisticBox;
