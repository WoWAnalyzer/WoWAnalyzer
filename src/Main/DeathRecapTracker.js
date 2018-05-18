import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Abilities from 'Parser/Core/Modules/Abilities';
import DEFENSIVE_BUFFS from 'common/DEFENSIVE_BUFFS';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Enemies from 'Parser/Core/Modules/Enemies';
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
  debuffs = [];
  enemyDebuffs = [];

  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
    spellUsable: SpellUsable,
    enemies: Enemies,
  };

  on_initialized() {
    const hasCooldown = ability =>  (ability.category === Abilities.SPELL_CATEGORIES.DEFENSIVE || ability.category === Abilities.SPELL_CATEGORIES.SEMI_DEFENSIVE) && ability.enabled === true;
    this.cooldowns = this.abilities.abilities.filter(hasCooldown);
    //add additional defensive buffs/debuffs to common/DEFENSIVE_BUFFS
    this.buffs = [...DEFENSIVE_BUFFS, ...this.cooldowns];
  }

  addEvent(event) {
    const extendedEvent = { ...event };
    extendedEvent.time = event.timestamp - this.owner.fight.start_time;
    extendedEvent.cooldownsAvailable = this.cooldowns.filter(e => this.spellUsable.isAvailable(e.spell.id));
    extendedEvent.cooldownsUsed = this.cooldowns.filter(e => !this.spellUsable.isAvailable(e.spell.id));
    if (event.hitPoints > 0) {
      this.lastBuffs = this.buffs.filter(e => this.combatants.selected.hasBuff(e.spell.buffSpellId) || this.combatants.selected.hasBuff(e.spell.id));
    }

    // if (!event.sourceIsFriendly) {
    //   console.info(event);
    //   console.info(this.enemies.enemies[event.sourceID]);
    //   console.info(this.buffs);
    //   console.info(this.enemies.enemies[event.sourceID].buffs.filter(buff => buff));
    // }
    
    extendedEvent.buffsUp = this.lastBuffs;
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
    const deaths = new Array(this.deaths.length);
    return this.deaths.map((deathtime, index) => {
      return deaths[index] = {
        deathtime: deathtime,
        events: this.events,
        open: false,
      };
    });
  }

  tab() {
    if (this.deaths.length === 0) {
      return;
    }

    return {
      title: 'Death Recap',
      url: 'death-recap',
      render: () => (
        <Tab>
          <DeathRecap events={this.secondsBeforeDeath} />
        </Tab>
      ),
    };
  }
}

export default DeathRecapTracker;
