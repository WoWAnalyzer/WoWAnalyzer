import Analyzer from 'parser/core/Analyzer';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import CurseOfAgony from '../spells/CurseOfAgony';
import CurseOfDoom from '../spells/CurseOfDoom';
import CurseOfTheElements from '../spells/CurseOfTheElements';
import Curses from '../spells/Curses';

class CurseUptimeStatisticBox extends Analyzer {
  static dependencies = {
    curseOfAgony: CurseOfAgony,
    curseOfDoom: CurseOfDoom,
    curseOfTheElements: CurseOfTheElements,
    curses: Curses,
  };
  protected curseOfAgony!: CurseOfAgony;
  protected curseOfDoom!: CurseOfDoom;
  protected curseOfTheElements!: CurseOfTheElements;
  protected curses!: Curses;

  statistic() {
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(1)}>
        {this.curseOfAgony.subStatistic()}
        {this.curseOfDoom.subStatistic()}
        {this.curseOfTheElements.subStatistic()}
      </StatisticBar>
    );
  }
}

export default CurseUptimeStatisticBox;
