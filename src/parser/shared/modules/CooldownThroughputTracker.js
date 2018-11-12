import React from 'react';

import SPELLS from 'common/SPELLS/index';

import Analyzer from 'parser/core/Analyzer';

import Tab from 'interface/others/Tab';
import CooldownOverview from 'interface/others/CooldownOverview';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';

const debug = false;

export const BUILT_IN_SUMMARY_TYPES = {
  HEALING: 'HEALING',
  OVERHEALING: 'OVERHEALING',
  ABSORBED: 'ABSORBED',
  ABSORBS_APPLIED: 'ABSORBS_APPLIED',
  MANA: 'MANA',
  DAMAGE: 'DAMAGE',
};

class CooldownThroughputTracker extends Analyzer {
  static cooldownSpells = [
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

  pastCooldowns = [];
  activeCooldowns = [];

  startCooldown(event) {
    const spellId = event.ability.guid;
    const cooldownSpell = this.constructor.cooldownSpells.find(cooldownSpell => cooldownSpell.spell.id === spellId);
    if (!cooldownSpell) {
      return;
    }
    const cooldown = this.addCooldown(cooldownSpell, event.timestamp);
    this.activeCooldowns.push(cooldown);
    debug && console.log(`%cCooldown started: ${cooldownSpell.spell.name}`, 'color: green', cooldown);
  }
  addCooldown(cooldownSpell, timestamp) {
    const cooldown = {
      ...cooldownSpell,
      start: timestamp,
      end: null,
      events: [],
    };
    this.pastCooldowns.push(cooldown);
    return cooldown;
  }
  endCooldown(event) {
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
  on_finished() {
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.end = this.owner.fight.end_time;
      debug && console.log(`%cCooldown ended: ${cooldown.spell.name}`, 'color: red', cooldown);
    });
    this.activeCooldowns = [];
  }

  // region Event tracking
  trackEvent(event) {
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.events.push(event);
    });
  }
  on_byPlayer_cast(event) {
    if (this.constructor.ignoredSpells.includes(event.ability.guid)) {
      return;
    }
    this.trackEvent(event);
  }
  on_byPlayer_heal(event) {
    this.trackEvent(event);
  }
  on_byPlayer_absorbed(event) {
    this.trackEvent(event);
  }
  on_byPlayer_damage(event) {
    this.trackEvent(event);
  }
  on_byPlayer_applybuff(event) {
    this.trackEvent(event);
  }
  on_toPlayer_applybuff(event) {
    this.startCooldown(event);
  }
  on_toPlayer_removebuff(event) {
    this.endCooldown(event);
  }
  on_byPlayer_applydebuff(event) {
    this.startCooldown(event);
  }
  on_byPlayer_removedebuff(event) {
    this.endCooldown(event);
  }
  // endregion

  tab() {
    return {
      title: 'Cooldowns',
      url: 'cooldowns',
      render: () => (
        <Tab>
          <CooldownOverview
            fightStart={this.owner.fight.start_time}
            fightEnd={this.owner.fight.end_time}
            cooldowns={this.pastCooldowns}
          />
        </Tab>
      ),
    };
  }
}

export default CooldownThroughputTracker;
