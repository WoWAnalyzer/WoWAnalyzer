import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import DevouringPlague from '../spells/DevouringPlague';
import ShadowWordPain from '../spells/ShadowWordPain';
import VampiricTouch from '../spells/VampiricTouch';
import DarkEvangelism from '../talents/DarkEvangelism';

import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';

class DotUptimes extends Analyzer {
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

  get guideSubsection() {
    const explanation = <p>Maintian your dots</p>;

    const data = (
      <RoundedPanel>
        <strong>DoT Uptimes; Dark Evangelism uptime is not calculated correctly here.</strong>
        {this.vampiricTouch.subStatistic()}
        {this.shadowWordPain.subStatistic()}
        {this.devouringPlague.subStatistic()}
        {this.darkEvangelism.active && this.darkEvangelism.subStatistic()}
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default DotUptimes;
