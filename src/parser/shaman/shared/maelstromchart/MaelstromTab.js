import React from 'react';
import Panel from 'interface/others/Panel';
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
        <Panel style={{ padding: '15px 22px' }}>
          <MaelstromChart
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
            maelstromMax={this.maelstromTracker._maxMaelstrom}
            maelstromPerSecond={this.maelstromTracker.maelstromBySecond}
            tracker={this.maelstromTracker.tracker}
            activeMaelstromGenerated={this.maelstromTracker.activeMaelstromGenerated}
            activeMaelstromWasted={this.maelstromTracker.activeMaelstromWasted}
            generatorCasts={this.maelstromTracker.generatorCasts}
            activeMaelstromWastedTimeline={this.maelstromTracker.activeMaelstromWastedTimeline}
          />
        </Panel>
      ),
    };
  }
}
export default MaelstromTab;
