import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import Haunt from '../../talents/Haunt';
import ShadowEmbrace from '../../talents/ShadowEmbrace';
import SiphonLifeUptime from '../../talents/SiphonLifeUptime';
import AgonyUptime from './AgonyUptime';
import CorruptionUptime from './CorruptionUptime';
import UnstableAfflictionUptime from './UnstableAfflictionUptime';

class DotUptimeStatisticBox extends Analyzer {
  static dependencies = {
    agonyUptime: AgonyUptime,
    corruptionUptime: CorruptionUptime,
    hauntUptime: Haunt,
    shadowEmbraceUptime: ShadowEmbrace,
    siphonLifeUptime: SiphonLifeUptime,
    unstableAfflictionUptime: UnstableAfflictionUptime,
  };
  protected agonyUptime!: AgonyUptime;
  protected corruptionUptime!: CorruptionUptime;
  protected hauntUptime!: Haunt;
  protected shadowEmbraceUptime!: ShadowEmbrace;
  protected siphonLifeUptime!: SiphonLifeUptime;
  protected unstableAfflictionUptime!: UnstableAfflictionUptime;

  statistic() {
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        {this.agonyUptime.subStatistic()}
        {this.corruptionUptime.subStatistic()}
        {this.unstableAfflictionUptime.subStatistic()}
        {this.siphonLifeUptime.active && this.siphonLifeUptime.subStatistic()}
        {this.shadowEmbraceUptime.subStatistic()}
        {this.hauntUptime.active && this.hauntUptime.subStatistic()}
      </StatisticBar>
    );
  }
}

export default DotUptimeStatisticBox;
