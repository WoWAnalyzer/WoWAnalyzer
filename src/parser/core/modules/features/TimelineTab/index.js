import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SpellHistory from 'parser/core/modules/SpellHistory';
import GlobalCooldown from 'parser/core/modules/GlobalCooldown';
import Channeling from 'parser/core/modules/Channeling';
import Abilities from 'parser/core/modules/Abilities';
import AbilityTracker from 'parser/core/modules/AbilityTracker';
import DeathTracker from 'parser/core/modules/DeathTracker';
import SpellUsable from 'parser/core/modules/SpellUsable';
import TimelineBuffEvents from 'parser/core/modules/TimelineBuffEvents';

import TabComponent from './TabComponent';

class TimelineTab extends Analyzer {
  static dependencies = {
    spellHistory: SpellHistory,
    globalCooldown: GlobalCooldown,
    channeling: Channeling,
    abilities: Abilities,
    abilityTracker: AbilityTracker,
    deathTracker: DeathTracker,
    spellUsable: SpellUsable,
    timelineBuffEvents: TimelineBuffEvents,
  };

  tab() {
    return {
      title: 'Timeline',
      url: 'timeline',
      order: 2,
      render: () => (
        <TabComponent
          start={this.owner.fight.start_time}
          end={this.owner.currentTimestamp >= 0 ? this.owner.currentTimestamp : this.owner.fight.end_time}
          historyBySpellId={this.spellHistory.historyBySpellId}
          globalCooldownHistory={this.globalCooldown.history}
          channelHistory={this.channeling.history}
          abilities={this.abilities}
          abilityTracker={this.abilityTracker}
          deaths={this.deathTracker.deaths}
          resurrections={this.deathTracker.resurrections}
          isAbilityCooldownsAccurate={this.spellUsable.isAccurate}
          isGlobalCooldownAccurate={this.globalCooldown.isAccurate}
          buffEvents={this.timelineBuffEvents.buffHistoryBySpellId}
        />
      ),
    };
  }
}

export default TimelineTab;
