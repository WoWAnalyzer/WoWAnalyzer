//Based on Main/Mana.js and parser/VengeanceDemonHunter/Modules/PainChart
//Note: For those that might wish to add Boss Health in the future- some of the work is already done here: https://github.com/leapis/WoWAnalyzer/tree/focusChartBossHealth

import { Panel } from 'interface';
import MaelstromTracker from './MaelstromTracker';
import ResourceGraph from 'parser/shared/modules/ResourceGraph';

const COLORS = {
  MAELSTROM_BORDER: 'rgba(0, 145, 255, 1)',
};

export default class MaelstromGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    maelstromTracker: MaelstromTracker,
  };

  protected maelstromTracker!: MaelstromTracker;

  includeWasted: boolean = true;

  lineColor(): string | undefined {
    return COLORS.MAELSTROM_BORDER;
  }

  tracker() {
    return this.maelstromTracker;
  }

  tab() {
    return {
      title: 'Maelstrom Chart',
      url: 'maelstrom',
      render: () => <Panel style={{ padding: '15px 22px' }}>{this.plot}</Panel>,
    };
  }
}
