import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import Combatants from 'parser/shared/modules/Combatants';
import StatisticBox from 'interface/others/StatisticBox';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemIcon from 'common/ItemIcon';
import SPECS from 'game/SPECS';
import SpellIcon from 'common/SpellIcon';
import SpecIcon from 'common/SpecIcon';
import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';
import Panel from 'interface/others/Panel';
import {formatNumber} from 'common/format';
import Events from 'parser/core/Events';

/**
 * Celestial Fortune
 *
 * CF has two effects:
 *
 * 1. Any non-absorb heal has a chance equal to your crit% to trigger
 * CF, healing you for an additional 65%
 *
 * 2. Any absorb is increased by a factor of (1 + crit%)
 *
 * This module tracks both and breaks down the healing done by source
 * player.
 */
class CelestialFortune extends Analyzer {
  static dependencies = {
    stats: StatTracker,
    combatants: Combatants,
  };

  critBonusHealing = 0;
  _totalHealing = 0;
  _overhealing = 0;
  _healingByEntityBySpell = {};
  _currentAbsorbs = {};

  _lastMaxHp = 0;

  get hps() {
    return this._totalHealing / (this.owner.fightDuration / 1000);
  }

  get totalHealing() {
    return this._totalHealing;
  }

  get bonusCritRatio() {
    return 1 - this.stats.baseCritPercentage / this.stats.currentCritPercentage;
  }

  constructor(options){
    super(options);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.absorbed.to(SELECTED_PLAYER), this.onAbsorb);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER), this.onRemoveBuff);
  }

  onHeal(event) {
    this._lastMaxHp = event.maxHitPoints ? event.maxHitPoints : this._lastMaxHp;
    if(event.ability.guid === SPELLS.CELESTIAL_FORTUNE_HEAL.id) {
      const amount = event.amount + (event.absorbed || 0);
      const overheal = event.overheal || 0;
      this._totalHealing += amount;
      this.critBonusHealing += Math.max(0, amount * this.bonusCritRatio);
      this._overhealing += overheal;
      this._queueHealing(event);
      return;
    } else {
      // only adds if a CF heal is queued
      this._addHealing(event);
    }
  }

  // track damage being absorbed
  onAbsorb(event) {
    if(event.ability.guid === SPELLS.STAGGER.id) {
      return;
    }

    if(!this._currentAbsorbs[event.sourceID]) {
      this._currentAbsorbs[event.sourceID] = {};
    }

    const sourceAbsorbs = this._currentAbsorbs[event.sourceID];
    sourceAbsorbs[event.ability.guid] = sourceAbsorbs[event.ability.guid] ? sourceAbsorbs[event.ability.guid] + event.amount : event.amount;
  }

  onRemoveBuff(event) {
    if(!this._currentAbsorbs[event.sourceID]) {
      return; // no absorbs from this source
    }

    const sourceAbsorbs = this._currentAbsorbs[event.sourceID];

    if(!sourceAbsorbs[event.ability.guid]) {
      return; // no absorbs from this (source, ability) pair
    }

    this._addAbsorb(sourceAbsorbs[event.ability.guid], event);

    sourceAbsorbs[event.ability.guid] = undefined;
  }

  _nextCFHeal = null;
  _queueHealing(event) {
    if(this._nextCFHeal !== null) {
      console.warn("Resetting CF healing", event);
    }
    this._nextCFHeal = event;
  }

  _initHealing(sourceId, id, absorb) {
    if(!this._healingByEntityBySpell[sourceId]) {
      this._healingByEntityBySpell[sourceId] = {
        _totalHealing: 0,
      };
    }
    if(!this._healingByEntityBySpell[sourceId][id]) {
      this._healingByEntityBySpell[sourceId][id] = {
        amount: 0,
        absorb,
      };
    }
  }

  _addHealing(event) {
    if(this._nextCFHeal === null) {
      return;
    }
    const totalCFAmount = this._nextCFHeal.amount + (this._nextCFHeal.overheal || 0);
    const totalAmount = event.amount + (event.overheal || 0);
    if(Math.abs(totalCFAmount - 0.65 * totalAmount) > 0.1 * totalAmount && totalAmount > 100) {
      console.warn("Potential CF misalignment", event, this._nextCFHeal);
    }

    const spellId = event.ability.guid;
    const sourceId = event.sourceID;
    this._initHealing(sourceId, spellId, false);
    this._healingByEntityBySpell[sourceId][spellId].amount += this._nextCFHeal.amount;
    this._healingByEntityBySpell[sourceId]._totalHealing += this._nextCFHeal.amount;
    this._nextCFHeal = null;
  }

  _addAbsorb(amountAbsorbed, event) {
    const crit = this.stats.currentCritPercentage;
    const sourceId = event.sourceID;
    const spellId = event.ability.guid;
    this._initHealing(sourceId, spellId, true);
    const totalAbsorb = amountAbsorbed + event.absorb;
    const cfBonus = totalAbsorb * crit / (1 + crit);
    // any absorb overhealing is taken from the cf bonus *first*
    const amount = Math.max(0, cfBonus - event.absorb);

    this._healingByEntityBySpell[sourceId][spellId].amount += amount;
    this._healingByEntityBySpell[sourceId]._totalHealing += amount;
    this._totalHealing += amount;
    this.critBonusHealing += amount * this.bonusCritRatio;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CELESTIAL_FORTUNE_HEAL.id} />}
        value={`${formatNumber(this.hps)} HPS`}
        label="Celestial Fortune Healing"
      />
    );
  }

  entries() {
    function playerSpan(id, style={float: 'left'}) {
      const combatant = this.combatants.players[id];
      if(!combatant) {
        return '';
      }
      const spec = SPECS[combatant.specId];
      const specClassName = spec.className.replace(' ', '');
      return (
        <span style={style} className={specClassName}><SpecIcon id={spec.id} />{` ${combatant.name}`}</span>
      );
    }

    const playerTable = ([sourceId, obj]) => {
      const tableEntries = Object.entries(obj)
        .filter(([id, {amount}]) => amount > this._lastMaxHp * 0.01)
        .sort(([idA, objA], [idB, objB]) => objB.amount - objA.amount);

      if(tableEntries.length === 0) {
        return null; // a few small healing sources, skipping
      }
      return (
        <tbody key={sourceId}>
          <tr>
            <th style={{width: '20%'}}>{playerSpan.call(this, sourceId)}</th>
            <th style={{width: '20%'}}>Spell</th>
            <th style={{width: '10%'}}>HPS</th>
            <th>Fraction of CF Healing</th>
            <th />
          </tr>
          {tableEntries
              .filter(([id, obj]) => id !== '_totalHealing')
              .map(([id, {absorb, amount}]) => (
                <tr key={id}>
                  <td />
                  <td>
                    <SpellLink id={Number(id)} icon={false}>
                      {SPELLS[id] ? <><Icon icon={SPELLS[id].icon} /> {SPELLS[id].name}</> : ITEMS[id] ? <><ItemIcon icon={ITEMS[id].icon} /> {ITEMS[id].name}</> : id}
                    </SpellLink>
                  </td>
                  <td>{absorb ? '≈': ''}{`${formatNumber(amount / (this.owner.fightDuration / 1000))} HPS`}</td>
                  <td style={{width: '20%'}}>
                    <div className="flex performance-bar-container">
                      <div
                        className="flex-sub performance-bar"
                        style={{ width: `${amount / this._totalHealing * 100}%`, backgroundColor: '#70b570' }}
                      />
                    </div>
                  </td>
                  <td className="text-left">
                    {`${(amount / this._totalHealing * 100).toFixed(2)}%`}
                  </td>
                </tr>
              ))}
              <tr>
                <td />
                <td>Total from {playerSpan.call(this, sourceId, {})}</td>
                <td>{`${formatNumber(obj._totalHealing / (this.owner.fightDuration / 1000))} HPS`}</td>
                <td style={{width: '20%'}}>
                  <div className="flex performance-bar-container">
                    <div
                      className="flex-sub performance-bar"
                      style={{ width: `${obj._totalHealing / this._totalHealing * 100}%`, backgroundColor: '#ff8000' }}
                    />
                  </div>
                </td>
                <td className="text-left">
                  {`${(obj._totalHealing / this._totalHealing * 100).toFixed(2)}%`}
                </td>
              </tr>
            </tbody>
      );
    };

    const entries = Object.entries(this._healingByEntityBySpell)
      .sort(([idA, objA], [idB, objB]) => objB._totalHealing - objA._totalHealing)
      .map(playerTable);
    return entries;
  }

  tab() {
    return {
      title: 'Celestial Fortune',
      url: 'celestial-fortune',
      render: () => (
        <Panel>
          <div style={{ marginTop: -10, marginBottom: -10 }}>
            <div style={{padding: '1em'}}>Bonus healing provided by <SpellLink id={SPELLS.CELESTIAL_FORTUNE_HEAL.id} />, broken down by triggering spell and which player cast that spell.</div>
            <table className="data-table" style={{ marginTop: 10, marginBottom: 10 }}>
              {this.entries()}
            </table>
          </div>
        </Panel>
      ),
    };
  }
}

export default CelestialFortune;
