import React from 'react';
import Combatants from 'Parser/Core/Modules/Combatants';
import Tab from 'Main/Tab';
import Analyzer from 'Parser/Core/Analyzer';
import MaelstromChart from './Maelstrom';
import MaelstromTracker from './MaelstromTracker';
class MaelstromTab extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    maelstromTracker: MaelstromTracker,
  };

  on_initialized() {
    console.debug("OI");
  }

  tab() {
    return {
      title: 'Maelstrom Chart',
      url: 'maelstrom',
      render: () => (
        <Tab title='Maelstrom' style={{ padding: '15px 22px' }}>
          <MaelstromChart
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
            playerHaste={this.owner.modules.combatants.selected.hasteRating}
            maelstromMax={this.owner.modules.maelstromTracker._maxMaelstrom}
            maelstromPerSecond={this.owner.modules.maelstromTracker.maelstromBySecond}
            tracker={this.owner.modules.maelstromTracker.tracker}
            secondsCapped={this.owner.modules.maelstromTracker.secondsCapped}
            activeMaelstromGenerated={this.owner.modules.maelstromTracker.activeMaelstromGenerated}
            activeMaelstromWasted={this.owner.modules.maelstromTracker.activeMaelstromWasted}
            generatorCasts={this.owner.modules.maelstromTracker.generatorCasts}
            activeMaelstromWastedTimeline={this.owner.modules.maelstromTracker.activeMaelstromWastedTimeline}
          />
        </Tab>
      ),
    };
  }
}

export default MaelstromTab;
