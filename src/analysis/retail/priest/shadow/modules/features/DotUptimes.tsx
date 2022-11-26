import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import DevouringPlague from '../spells/DevouringPlague';
import ShadowWordPain from '../spells/ShadowWordPain';
import VampiricTouch from '../spells/VampiricTouch';
import DarkEvangelism from '../talents/DarkEvangelism';

class DotUptimeStatisticBox extends Analyzer {
  static dependencies = {
    vampiricTouch: VampiricTouch,
    shadowWordPain: ShadowWordPain,
    devouringPlague: DevouringPlague,
    darkEvangelism: DarkEvangelism,
  };
  protected vampiricTouch!: VampiricTouch;
  protected shadowWordPain!: ShadowWordPain;
  protected devouringPlague!: DevouringPlague;
  protected darkEvangelism!: DarkEvangelism;

  statistic() {
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        {this.vampiricTouch.subStatistic()}
        {this.shadowWordPain.subStatistic()}
        {this.devouringPlague.subStatistic()}
        {this.darkEvangelism.active && this.darkEvangelism.subStatistic()}
      </StatisticBar>
    );
  }
}

export default DotUptimeStatisticBox;
