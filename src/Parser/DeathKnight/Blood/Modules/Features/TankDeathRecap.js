import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Abilities from 'Parser/Core/Modules/Abilities';
import SpellIcon from 'common/SpellIcon';
import Tab from 'Main/Tab';
import { formatDuration, formatNumber } from 'common/format';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import './TankDeathRecap.css';

const SHOW_SECONDS_BEFORE_DEATH = 8;
const AMOUNT_THRESHOLD = 300000;

class TankDeathRecap extends Analyzer {

  deaths = [];
  healed = [];
  damaged = [];
  cooldowns = [];

  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  on_initialized() {
    this.cooldowns = this.abilities.abilities.filter(e => e.category === Abilities.SPELL_CATEGORIES.DEFENSIVE || e.category === Abilities.SPELL_CATEGORIES.SEMI_DEFENSIVE);
  }

  on_toPlayer_heal(event) {
    if (event.amount + (event.absorbed || 0) < AMOUNT_THRESHOLD) {
      return;
    }
    const extendedEvent = event;
    extendedEvent.cooldownsAvailable = this.cooldowns.filter(e => this.spellUsable.isAvailable(e.spell.id));
    extendedEvent.buffsUp = this.cooldowns.filter(e => this.combatants.selected.hasBuff(e.spell.id));
    this.healed.push(extendedEvent);
  }

  on_toPlayer_damage(event) {
    if (event.amount + (event.absorbed || 0) < AMOUNT_THRESHOLD) {
      return;
    }
    const extendedEvent = event;
    extendedEvent.cooldownsAvailable = this.cooldowns.filter(e => this.spellUsable.isAvailable(e.spell.id));
    extendedEvent.buffsUp = this.cooldowns.filter(e => this.combatants.selected.hasBuff(e.spell.id));
    this.damaged.push(extendedEvent);
  }

  on_toPlayer_death(event) {
    this.deaths.push(event.timestamp);
  }

  get secondsBeforeDeath() {
    const deaths = new Array(this.deaths.length);
    this.deaths.forEach((deathtime, index) => {
      const healed = this.healed.filter(e => e.timestamp <= deathtime && e.timestamp >= deathtime - (SHOW_SECONDS_BEFORE_DEATH * 1000));
      const damaged = this.damaged.filter(e => e.timestamp <= deathtime && e.timestamp >= deathtime - (SHOW_SECONDS_BEFORE_DEATH * 1000));
      deaths[index] = healed.concat(damaged);
    });
    return deaths;
  }

  tab() {

    let lastHitPoints = 0;
    let lastMaxHitPoints = 0;

    return {
      title: "Death Recap",
      url: "death-recap",
      render: () => (
        <Tab>
          {this.secondsBeforeDeath.map((death, i) => 
            <div>
              <h2>Death #{i + 1}</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Ability</th>
                    <th>Amount</th>
                    <th>HP</th>
                    <th>Defensive Buffs up</th>
                    <th>Cooldowns available</th>
                  </tr>
                </thead>
                <tbody>

                </tbody>
                {death.sort((a, b) => a.timestamp - b.timestamp).map((event, index) => {
                  if (event.hitPoints && event.maxHitPoints) {
                    lastHitPoints = event.hitPoints;
                    lastMaxHitPoints = event.maxHitPoints;
                  }
                  
                  const hitPercent = event.amount / lastMaxHitPoints * 100
                  let percent = lastHitPoints / lastMaxHitPoints * 100;
                  if (event.type === 'heal') {
                    percent = (lastHitPoints - event.amount) / lastMaxHitPoints * 100
                  }

                  return (
                    <tr>
                      <td style={{ width: '5%'}}>
                        {formatDuration((event.timestamp - this.owner.fight.start_time) / 1000, 2)}
                      </td>
                      <td style={{ width: '15%'}}>
                        {event.ability.name}
                      </td>
                      <td style={{ width: '20%'}} className={`hit-type-${event.hitType}`}>
                        <span className={`event-${event.type}`}>
                          {formatNumber(event.amount)}
                          {event.absorbed > 0 && (
                            <span> (A: {formatNumber(event.absorbed)}) </span>
                          )}
                          {event.overheal > 0 && (
                            <span> (O: {formatNumber(event.overheal)}) </span>
                          )}
                        </span>
                      </td>
                      <td style={{ width: '35%'}}>
                        <div className="flex performance-bar-container">
                          <div className="flex-sub performance-bar" style={{ color: 'white', width: percent + "%" }}></div>
                          <div className={`flex-sub performance-bar event-${event.type}`} style={{ width: hitPercent + "%", opacity: event.type === 'heal' ? .8 : .4 }}></div>
                        </div>
                      </td>
                      <td>
                        {event.buffsUp.map(e =>
                          <SpellIcon id={e.spell.id} />
                        )}
                      </td>
                      <td>
                        {event.cooldownsAvailable.map(e =>
                          <SpellIcon id={e.spell.id} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </table>
            </div>
          )}
        </Tab>
      ),
    };
  }
}

export default TankDeathRecap;
