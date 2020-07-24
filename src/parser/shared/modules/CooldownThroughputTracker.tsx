import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Panel from 'interface/others/Panel';
import CooldownIcon from 'interface/icons/Cooldown';
import CooldownOverview from 'interface/others/CooldownOverview';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import EventHistory from 'parser/shared/modules/EventHistory';
import Events, { Event, AbsorbedEvent, ApplyBuffEvent, ApplyDebuffEvent, CastEvent, DamageEvent, HealEvent, RemoveBuffEvent, RemoveDebuffEvent } from 'parser/core/Events';
import EventFilter from 'parser/core/EventFilter';

const debug = false;

export enum BUILT_IN_SUMMARY_TYPES {
  HEALING = 'HEALING',
  OVERHEALING = 'OVERHEALING',
  ABSORBED = 'ABSORBED',
  ABSORBS_APPLIED = 'ABSORBS_APPLIED',
  MANA = 'MANA',
  DAMAGE = 'DAMAGE',
}

type TrackedEvent = CastEvent | HealEvent | AbsorbedEvent | DamageEvent | ApplyBuffEvent;

export type CooldownSpell = {
  spell: any,
  summary: Array<BUILT_IN_SUMMARY_TYPES>,
  startBufferFilter?: EventFilter<any>,
  startBufferMS?: number,
  startBufferEvents?: number,
};

type TrackedCooldown = CooldownSpell & {
  start: number,
  end: number | null,
  events: Array<Event<any>>,
};

class CooldownThroughputTracker extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  static cooldownSpells: Array<CooldownSpell> = [
    {
      spell: SPELLS.INNERVATE,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
    },
  ];

  static ignoredSpells = [
    // general spells that you don't want to see in the Cooldown overview (could be boss mechanics etc.) should belong here
    // if you want to add some spells specific to your spec, redefine this array in your spec CooldownThroughputTracker similarly to cooldownSpells (see Marksmanship Hunter for example)
    ...CASTS_THAT_ARENT_CASTS,
  ];

  pastCooldowns: Array<TrackedCooldown> = [];
  activeCooldowns: Array<TrackedCooldown> = [];

  startCooldown(event: CastEvent | ApplyBuffEvent | ApplyDebuffEvent) {
    const spellId = event.ability.guid;
    const ctor = this.constructor as typeof CooldownThroughputTracker;
    const cooldownSpell = ctor.cooldownSpells.find(cooldownSpell => cooldownSpell.spell.id === spellId);
    if (!cooldownSpell) {
      return;
    }
    const cooldown = this.addCooldown(cooldownSpell, event.timestamp);
    this.activeCooldowns.push(cooldown);
    debug && console.log(`%cCooldown started: ${cooldownSpell.spell.name}`, 'color: green', cooldown);
  }

  addCooldown(cooldownSpell: CooldownSpell, timestamp: number): TrackedCooldown {
    let events: Array<Event<any>> = [];
    let start = timestamp;
    const startBufferMS = cooldownSpell.startBufferMS;
    if (startBufferMS || cooldownSpell.startBufferEvents) {
      // Default to only including cast events by the player
      const filter = cooldownSpell.startBufferFilter || Events.cast.by(SELECTED_PLAYER);
      events = this.eventHistory.last(cooldownSpell.startBufferEvents, startBufferMS, filter);
      if(startBufferMS) {
        start = timestamp - startBufferMS;
      } else {
        // If filtering by only event count, set the start timestamp to the oldest event found
        start = (events[0] && events[0].timestamp) || start;
      }
    }
    const cooldown = {
      ...cooldownSpell,
      start: start,
      end: null,
      events: events,
    };

    this.pastCooldowns.push(cooldown);
    return cooldown;
  }

  endCooldown(event: RemoveDebuffEvent | RemoveBuffEvent) {
    const spellId = event.ability.guid;
    const index = this.activeCooldowns.findIndex(cooldown => cooldown.spell.id === spellId);
    if (index === -1) {
      return;
    }

    const cooldown = this.activeCooldowns[index];
    cooldown.end = event.timestamp;
    this.activeCooldowns.splice(index, 1);
    debug && console.log(`%cCooldown ended: ${cooldown.spell.name}`, 'color: red', cooldown);
  }

  on_fightend() {
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.end = this.owner.fight.end_time;
      debug && console.log(`%cCooldown ended: ${cooldown.spell.name}`, 'color: red', cooldown);
    });
    this.activeCooldowns = [];
  }

  // region Event tracking
  trackEvent(event: TrackedEvent) {
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.events.push(event);
    });
  }

  on_byPlayer_cast(event: CastEvent) {
    const ctor = this.constructor as typeof CooldownThroughputTracker;
    if (ctor.ignoredSpells.includes(event.ability.guid)) {
      return;
    }
    this.trackEvent(event);
  }

  on_byPlayer_heal(event: HealEvent) {
    this.trackEvent(event);
  }

  on_byPlayer_absorbed(event: AbsorbedEvent) {
    this.trackEvent(event);
  }

  on_byPlayer_damage(event: DamageEvent) {
    this.trackEvent(event);
  }

  on_byPlayer_applybuff(event: ApplyBuffEvent) {
    this.trackEvent(event);
  }

  on_toPlayer_applybuff(event: ApplyBuffEvent) {
    this.startCooldown(event);
  }

  on_toPlayer_removebuff(event: RemoveBuffEvent) {
    this.endCooldown(event);
  }

  on_byPlayer_applydebuff(event: ApplyDebuffEvent) {
    this.startCooldown(event);
  }

  on_byPlayer_removedebuff(event: RemoveDebuffEvent) {
    this.endCooldown(event);
  }

  // endregion

  tab() {
    return {
      title: 'Cooldowns',
      icon: CooldownIcon,
      url: 'cooldowns',
      render: () => (
        <Panel
          title="Throughput cooldowns"
          explanation={(
            <>
              This shows the effectiveness of your throughput cooldowns and your cast behavior during them. Click on <i>More</i> to see details such as the delay between casting spells and the healing or damage done with them. Take a look at the timeline for a different kind of view of your casts during buffs.
            </>
          )}
          pad={false}
        >
          <CooldownOverview
            fightStart={this.owner.fight.start_time - this.owner.fight.offset_time}
            fightEnd={this.owner.fight.end_time}
            cooldowns={this.pastCooldowns}
            applyTimeFilter={this.owner.applyTimeFilter}
          />
        </Panel>
      ),
    };
  }
}

export default CooldownThroughputTracker;
