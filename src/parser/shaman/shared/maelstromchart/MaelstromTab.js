import React from 'react';
import Tab from 'interface/others/Tab';
import Analyzer from 'parser/core/Analyzer';
import MaelstromChart from './Maelstrom';
import MaelstromTracker from './MaelstromTracker';
class MaelstromTab extends Analyzer {

  static dependencies = {
    maelstromTracker: MaelstromTracker,
  };

  tab() {
    return {
      title: 'Maelstrom Chart',
      url: 'maelstrom',
      render: () => (
        <Tab style={{ padding: '15px 22px' }}>
          <MaelstromChart
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
            maelstromMax={100}
            tracker={this.maelstromTracker}
          />
        </Tab>
      ),
    };
  }
}
export default MaelstromTab;
