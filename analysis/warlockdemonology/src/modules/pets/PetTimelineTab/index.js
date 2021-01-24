import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import DeathTracker from 'parser/shared/modules/DeathTracker';
import SpellHistory from 'parser/shared/modules/SpellHistory';

import DemoPets from '../DemoPets';
import TabComponent from './TabComponent';

class PetTimelineTab extends Analyzer {
  static dependencies = {
    spellHistory: SpellHistory,
    deathTracker: DeathTracker,
    demoPets: DemoPets,
  };

  tab() {
    return {
      title: 'Pet Timeline',
      url: 'pet-timeline',
      order: 3,
      render: () => (
        <TabComponent
          selectedCombatant={this.selectedCombatant}
          start={this.owner.fight.start_time}
          end={this.owner.currentTimestamp >= 0 ? this.owner.currentTimestamp : this.owner.fight.end_time}
          deaths={this.deathTracker.deaths}
          petTimeline={this.demoPets.timeline}
          resurrections={this.deathTracker.resurrections}
          historyBySpellId={this.spellHistory.historyBySpellId}
        />
      ),
    };
  }
}

export default PetTimelineTab;
