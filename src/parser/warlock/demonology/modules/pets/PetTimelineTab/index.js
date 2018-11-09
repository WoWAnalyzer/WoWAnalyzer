import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import DeathTracker from 'parser/shared/modules/DeathTracker';
import SpellHistory from 'parser/shared/modules/SpellHistory';

import Pets from '../Pets';
import TabComponent from './TabComponent';

class PetTimelineTab extends Analyzer {
  static dependencies = {
    spellHistory: SpellHistory,
    deathTracker: DeathTracker,
    pets: Pets,
  };

  tab() {
    return {
      title: 'Pet Timeline',
      url: 'pet-timeline',
      order: 3,
      render: () => (
        <TabComponent
          start={this.owner.fight.start_time}
          end={this.owner.currentTimestamp >= 0 ? this.owner.currentTimestamp : this.owner.fight.end_time}
          deaths={this.deathTracker.deaths}
          petTimeline={this.pets.timeline}
          resurrections={this.deathTracker.resurrections}
          historyBySpellId={this.spellHistory.historyBySpellId}
        />
      ),
    };
  }
}

export default PetTimelineTab;
