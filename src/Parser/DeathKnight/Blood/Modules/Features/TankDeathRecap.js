import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Abilities from 'Parser/Core/Modules/Abilities';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
import Tab from 'Main/Tab';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import './TankDeathRecap.css';

const SHOW_SECONDS_BEFORE_DEATH = 8;
const AMOUNT_THRESHOLD = 0;

class TankDeathRecap extends Analyzer {

  deaths = [];
  events = [];
  healed = [];
  damaged = [];
  cooldowns = [];

  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  on_initialized() {
    this.cooldowns = this.abilities.abilities.filter(e => 
      (e.category === Abilities.SPELL_CATEGORIES.DEFENSIVE || e.category === Abilities.SPELL_CATEGORIES.SEMI_DEFENSIVE) &&
      e.enabled === true
    );
  }

  on_toPlayer_heal(event) {
    if (event.amount + (event.absorbed || 0) < AMOUNT_THRESHOLD) {
      return;
    }
    const extendedEvent = event;
    extendedEvent.cooldownsAvailable = this.cooldowns.filter(e => this.spellUsable.isAvailable(e.spell.id));
    extendedEvent.cooldownsUsed = this.cooldowns.filter(e => !this.spellUsable.isAvailable(e.spell.id));
    extendedEvent.buffsUp = this.cooldowns.filter(e => this.combatants.selected.hasBuff(e.spell.id));
    this.events.push(extendedEvent);
  }

  on_toPlayer_damage(event) {
    if (event.amount + (event.absorbed || 0) < AMOUNT_THRESHOLD) {
      return;
    }
    const extendedEvent = event;
    extendedEvent.cooldownsAvailable = this.cooldowns.filter(e => this.spellUsable.isAvailable(e.spell.id));
    extendedEvent.cooldownsUsed = this.cooldowns.filter(e => !this.spellUsable.isAvailable(e.spell.id));
    extendedEvent.buffsUp = this.cooldowns.filter(e => this.combatants.selected.hasBuff(e.spell.id));
    this.events.push(extendedEvent);
  }

  on_toPlayer_death(event) {
    this.deaths.push(event.timestamp);
  }

  get secondsBeforeDeath() {
    const deaths = new Array(this.deaths.length);
    this.deaths.forEach((deathtime, index) => {
      deaths[index] = {
        events: this.events.filter(e => e.timestamp <= deathtime && e.timestamp >= deathtime - (SHOW_SECONDS_BEFORE_DEATH * 1000)),
        open: false,
      };
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
              <h2 style={{ padding: '10px 20px'}}>Death #{i + 1}</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Ability</th>
                    <th>HP</th>
                    <th>Amount</th>
                    <th>Defensive Buffs up</th>
                    <th>Personals available</th>
                  </tr>
                </thead>
                <tbody>
                  {death.events.map((event, index) => {
                    if (event.hitPoints && event.maxHitPoints) {
                      lastHitPoints = event.hitPoints;
                      lastMaxHitPoints = event.maxHitPoints;
                    }
                    
                    const hitPercent = event.amount / lastMaxHitPoints;
                    let percent = lastHitPoints / lastMaxHitPoints;
                    if (event.type === 'heal') {
                      percent = (lastHitPoints - event.amount) / lastMaxHitPoints;
                    }

                    if (event.overkill) {
                      percent = 0;
                    }

                    console.info(event);

                    return (
                      <tr>
                        <td style={{ width: '5%'}}>
                          {formatDuration((event.timestamp - this.owner.fight.start_time) / 1000, 2)}
                        </td>
                        <td style={{ width: '20%'}}>
                          <Icon icon={event.ability.abilityIcon} /> {event.ability.name}
                        </td>
                        <td style={{ width: '20%'}}>
                          <div className="flex performance-bar-container">
                            <div className="flex-sub performance-bar" style={{ color: 'white', width: formatPercentage(percent) + "%" }}></div>
                            <div className={`flex-sub performance-bar event-${event.type}`} style={{ width: formatPercentage(hitPercent) + "%", opacity: event.type === 'heal' ? .8 : .4 }}></div>
                          </div>
                        </td>
                        <td style={{ width: '15%'}}>
                          <span className={`event-${event.type}`}>
                            {(event.type === 'damage' ? '-' : '') + formatNumber(event.amount)}
                            {event.absorbed > 0 && (
                              <span> (A: {formatNumber(event.absorbed)}) </span>
                            )}
                            {event.overheal > 0 && (
                              <span> (O: {formatNumber(event.overheal)}) </span>
                            )}
                            {' '}@ {formatPercentage(percent)}%
                          </span>
                        </td>
                        <td style={{ width: '20%' }}>
                          {event.buffsUp.map(e =>
                            <SpellIcon id={e.spell.id} />
                          )}
                        </td>
                        <td style={{ width: '15%' }}>
                          {event.cooldownsAvailable.map(e =>
                            <SpellIcon id={e.spell.id} />
                          )}
                          {event.cooldownsUsed.map(e =>
                            <SpellIcon id={e.spell.id} style={{ opacity: .2 }} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td></td>
                    <td colSpan="5">
                      Killing blow
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Tab>
      ),
    };
  }
}

export default TankDeathRecap;
