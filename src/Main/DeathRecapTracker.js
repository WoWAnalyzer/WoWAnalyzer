import React from 'react';

import DEFENSIVE_BUFFS from 'common/DEFENSIVE_BUFFS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Abilities from 'Parser/Core/Modules/Abilities';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Enemies from 'Parser/Core/Modules/Enemies';
import Healthstone from 'Parser/Core/Modules/Items/Healthstone';
import Tab from 'Main/Tab';

import DeathRecap from './DeathRecap';

class DeathRecapTracker extends Analyzer {
  deaths = [];
  events = [];
  healed = [];
  damaged = [];
  cooldowns = [];
  buffs = [];
  lastBuffs = [];

  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
    spellUsable: SpellUsable,
    enemies: Enemies,
    healthstone: Healthstone,
  };

  on_initialized() {
    this.cooldowns = this.abilities.abilities.filter(ability => (
      (
        ability.category === Abilities.SPELL_CATEGORIES.DEFENSIVE
        || ability.category === Abilities.SPELL_CATEGORIES.SEMI_DEFENSIVE
        || ability.isDefensive
      )
      && ability.enabled === true
    ));
    //add additional defensive buffs/debuffs to common/DEFENSIVE_BUFFS
    this.buffs = [...DEFENSIVE_BUFFS, ...this.cooldowns];
  }

  addEvent(event) {
    const extendedEvent = { ...event };
    extendedEvent.time = event.timestamp - this.owner.fight.start_time;

    const cooldownsOnly = this.cooldowns.filter(e => e.cooldown);
    extendedEvent.defensiveCooldowns = cooldownsOnly.map(e => ({id: e.primarySpell.id, cooldownReady: this.spellUsable.isAvailable(e.primarySpell.id)}));
    if (event.hitPoints > 0) {
      this.lastBuffs = this.buffs.filter(e => this.combatants.selected.hasBuff(e.buffSpellId) || this.combatants.selected.hasBuff(e.spell instanceof Array ? e.spell[0].id : e.spell.id)) // Since we don't know if e is an instance of spell or ability we can't use ability.primarySpell
        .map(e => ({id: e.buffSpellId || e.spell.id}));
    }
    extendedEvent.buffsUp = this.lastBuffs;

    if (!event.sourceIsFriendly && this.enemies.enemies[event.sourceID]) {
      const sourceHasDebuff = debuff => (!debuff.end || event.timestamp <= debuff.end) && event.timestamp >= debuff.start && debuff.isDebuff && this.buffs.some(e => e.buffSpellId === debuff.ability.guid || e.spell.id === debuff.ability.guid);
      extendedEvent.debuffsUp = this.enemies.enemies[event.sourceID].buffs.filter(sourceHasDebuff)
        .map(e => ({id: e.ability.guid }));
    }

    this.events.push(extendedEvent);
  }

  on_toPlayer_heal(event) {
    this.addEvent(event);
  }

  on_toPlayer_damage(event) {
    this.addEvent(event);
  }

  on_toPlayer_instakill(event) {
    this.addEvent(event);
  }

  on_toPlayer_death(event) {
    this.addEvent(event);
    this.deaths.push(event.timestamp);
  }

  get secondsBeforeDeath() {
    return this.deaths.map(deathtime => ({
      deathtime,
      events: this.events,
      open: false,
    }));
  }

  tab() {
    if (this.deaths.length === 0) {
      return null;
    }

    return {
      title: 'Death Recap',
      url: 'death-recap',
      render: () => (
        <Tab>
          <DeathRecap
            report={this.owner}
            events={this.secondsBeforeDeath}
            combatants={this.combatants.players}
            enemies={this.enemies.enemies}
          />
        </Tab>
      ),
    };
  }
}

export default DeathRecapTracker;
