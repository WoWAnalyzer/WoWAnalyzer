import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SpellHistory from 'Parser/Core/Modules/SpellHistory';
import GlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';
import Channeling from 'Parser/Core/Modules/Channeling';
import Abilities from 'Parser/Core/Modules/Abilities';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import DeathTracker from 'Parser/Core/Modules/DeathTracker';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import TimelineBuffEvents from 'Parser/Core/Modules/TimelineBuffEvents';

import TimelineTab from './TabComponent';

class Timeline extends Analyzer {
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
        <TimelineTab
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

export default Timeline;
