import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import Panel from 'interface/others/Panel';
import FocusChartIcon from 'interface/icons/Vision';

import FocusChart from './Focus';
import FocusTracker from './FocusTracker';

class FocusTab extends Analyzer {
  static dependencies = {
    focusTracker: FocusTracker,
    statTracker: StatTracker,
  };

  tab() {
    return {
      title: 'Focus Chart',
      url: 'focus',
      icon: FocusChartIcon,
      order: 100,
      render: () => (
        <Panel style={{ padding: '15px 22px' }}>
          <FocusChart
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
            playerHaste={this.statTracker.startingHasteRating} // TODO: Account for Haste buffs
            focusMax={this.focusTracker._maxFocus}
            focusPerSecond={this.focusTracker.focusBySecond}
            tracker={this.focusTracker.tracker}
            secondsCapped={this.focusTracker.secondsCapped}
            activeFocusGenerated={this.focusTracker.activeFocusGenerated}
            activeFocusWasted={this.focusTracker.activeFocusWasted}
            generatorCasts={this.focusTracker.generatorCasts}
            activeFocusWastedTimeline={this.focusTracker.activeFocusWastedTimeline}
          />
        </Panel>
      ),
    };
  }
}

export default FocusTab;
