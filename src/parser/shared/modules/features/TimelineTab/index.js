import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SpellHistory from 'parser/shared/modules/SpellHistory';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import Channeling from 'parser/shared/modules/Channeling';
import Abilities from 'parser/core/modules/Abilities';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import DeathTracker from 'parser/shared/modules/DeathTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TimelineBuffEvents from 'parser/shared/modules/TimelineBuffEvents';

import Timeline from '../Timeline';

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
        <Timeline
          parser={this.owner}
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
    // render: () => (
    //   <TabComponent
    //     start={this.owner.fight.start_time}
    //     end={this.owner.currentTimestamp >= 0 ? this.owner.currentTimestamp : this.owner.fight.end_time}
    //     historyBySpellId={this.spellHistory.historyBySpellId}
    //     globalCooldownHistory={this.globalCooldown.history}
    //     channelHistory={this.channeling.history}
    //     abilities={this.abilities}
    //     abilityTracker={this.abilityTracker}
    //     deaths={this.deathTracker.deaths}
    //     resurrections={this.deathTracker.resurrections}
    //     isAbilityCooldownsAccurate={this.spellUsable.isAccurate}
    //     isGlobalCooldownAccurate={this.globalCooldown.isAccurate}
    //     buffEvents={this.timelineBuffEvents.buffHistoryBySpellId}
    //   />
    // ),
  }
    ;
  }
}

export default TimelineTab;
