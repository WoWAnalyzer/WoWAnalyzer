import React from 'react';
import Combatants from 'Parser/Core/Modules/Combatants';
import Tab from 'Main/Tab';
import Analyzer from 'Parser/Core/Analyzer';
import FocusChart from './Focus';
import FocusTracker from './FocusTracker';

class FocusTab extends Analyzer {

  static dependencies = {
    focusTracker: FocusTracker,
    combatants: Combatants,
  };

  tab() {
    return {
      title: 'Focus Chart',
      url: 'focus',
      render: () => (
        <Tab title='focus' style={{ padding: '15px 22px' }}>
          <FocusChart
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
            playerHaste={this.combatants.selected.hasteRating}
            focusMax={this.focusTracker._maxFocus}
            focusPerSecond={this.focusTracker.focusBySecond}
            tracker={this.focusTracker.tracker}
            secondsCapped={this.focusTracker.secondsCapped}
            activeFocusGenerated={this.focusTracker.activeFocusGenerated}
            activeFocusWasted={this.focusTracker.activeFocusWasted}
            generatorCasts={this.focusTracker.generatorCasts}
            activeFocusWastedTimeline={this.focusTracker.activeFocusWastedTimeline}
          />
        </Tab>
      ),
    };
  }
}

export default FocusTab;
