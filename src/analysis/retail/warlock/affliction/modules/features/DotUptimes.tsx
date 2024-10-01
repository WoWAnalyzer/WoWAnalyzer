import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import Agony from '../spells/Agony';
import Corruption from '../spells/Corruption';
import Haunt from '../spells/Haunt';
import ShadowEmbrace from '../spells/ShadowEmbrace';
import UnstableAffliction from '../spells/UnstableAffliction';

class DotUptimeStatisticBox extends Analyzer {
  static dependencies = {
    agonyUptime: Agony,
    corruptionUptime: Corruption,
    hauntUptime: Haunt,
    shadowEmbraceUptime: ShadowEmbrace,
    unstableAfflictionUptime: UnstableAffliction,
  };
  protected agonyUptime!: Agony;
  protected corruptionUptime!: Corruption;
  protected hauntUptime!: Haunt;
  protected shadowEmbraceUptime!: ShadowEmbrace;
  protected unstableAfflictionUptime!: UnstableAffliction;

  statistic() {
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        {this.agonyUptime.subStatistic()}
        {this.corruptionUptime.subStatistic()}
        {this.unstableAfflictionUptime.subStatistic()}
        {this.shadowEmbraceUptime.subStatistic()}
        {this.hauntUptime.active && this.hauntUptime.subStatistic()}
      </StatisticBar>
    );
  }
}

export default DotUptimeStatisticBox;
