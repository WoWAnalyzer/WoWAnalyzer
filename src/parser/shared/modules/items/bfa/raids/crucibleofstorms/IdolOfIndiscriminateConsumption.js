import React from 'react';

import ITEMS from 'common/ITEMS/index';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import { formatNumber, formatPercentage, formatDuration } from 'common/format';
import { TooltipElement } from 'common/Tooltip';
import ItemLink from 'common/ItemLink';

// Example log: https://www.warcraftlogs.com/reports/D4LF8KhaAmBJ6T7x#fight=13&source=5

class IdolOfIndiscriminateConsumption extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  static cooldown = 60; //seconds
  static maxTargets = 7;
  static hpSuggestionThreshold = 0.6; //% HP below which a cast is considered wasteful
  casts = 0;
  byCast = {};

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.IDOL_OF_INDISCRIMINATE_CONSUMPTION.id);
    if(!this.active){
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.INDISCRIMINATE_CONSUMPTION), this._damage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.INDISCRIMINATE_CONSUMPTION_HEAL), this._heal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INDISCRIMINATE_CONSUMPTION), this._cast);

    this.abilities.add({
      spell: SPELLS.INDISCRIMINATE_CONSUMPTION,
      name: ITEMS.IDOL_OF_INDISCRIMINATE_CONSUMPTION.name,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      cooldown: this.constructor.cooldown,
      castEfficiency: {
        suggestion: false,
      },
    });
  }

  _cast(event){
    this.casts += 1;
    this.byCast[this.casts] = {
      time: event.timestamp - this.owner.fight.start_time,
      healing: 0,
      overHealing: 0,
      damage: 0,
      friendlyDamage: 0,
      targets: 0,
      missingHP: event.maxHitPoints - event.hitPoints,
      totalHP: event.maxHitPoints,
    };
  }

  _damage(event){
    const amount = (event.amount || 0) + (event.absorbed || 0);
    if(event.targetIsFriendly){
      this.byCast[this.casts].friendlyDamage += amount;
    }else{
      this.byCast[this.casts].damage += amount;
    }
    this.byCast[this.casts].targets += 1;
  }

  _heal(event){
    this.byCast[this.casts].healing += (event.amount || 0) + (event.absorbed || 0);
    this.byCast[this.casts].overHealing += event.overheal || 0;
  }

  get overhealPercent() {
    return this.overHealing / this.totalHealing;
  }

  get damage(){
    return Object.values(this.byCast).reduce((total, cur) => total + cur.damage, 0);
  }

  get healing(){
    return Object.values(this.byCast).reduce((total, cur) => total + cur.healing, 0);
  }

  get overHealing(){
    return Object.values(this.byCast).reduce((total, cur) => total + cur.overHealing, 0);
  }

  get friendlyDamage(){
    return Object.values(this.byCast).reduce((total, cur) => total + cur.friendlyDamage, 0);
  }

  get totalHealing(){
    return Object.values(this.byCast).reduce((total, cur) => total + cur.healing + cur.overHealing, 0);
  }

  get totalDamage(){
    return Object.values(this.byCast).reduce((total, cur) => total + cur.friendlyDamage + cur.damage, 0);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
          Uses: {this.casts}<br />
          Damage to allies: {formatNumber(this.friendlyDamage)}<br />
          Damage to enemies: {formatNumber(this.damage)}
          </>
        )}
        dropdown={(
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Time</th>
                <th>Healing</th>
                <th>OH</th>
                <th>Enemy Damage</th>
                <th>Ally Damage</th>
              </tr>
            </thead>
            <tbody>
              {
                Object.keys(this.byCast).map(cast => {
                  return (
                    <tr key={cast}>
                      <th>{formatDuration((this.byCast[cast].time + this.owner.fight.offset_time) / 1000)}</th>
                      <td>{formatNumber(this.byCast[cast].healing)}</td>
                      <td>{formatNumber(this.byCast[cast].overHealing)}</td>
                      <td>{formatNumber(this.byCast[cast].damage)}</td>
                      <td>{formatNumber(this.byCast[cast].friendlyDamage)}</td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        )}
      >
        <BoringItemValueText item={ITEMS.IDOL_OF_INDISCRIMINATE_CONSUMPTION}>
          <TooltipElement content={`Healing done: ${formatNumber(this.healing)} (${formatPercentage(this.overhealPercent)}% OH)`}>
            <ItemHealingDone amount={this.healing} />
          </TooltipElement>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }

  get wastedCasts() {
    return Object.keys(this.byCast).reduce((total, cast) => {
      const percHP = (this.byCast[cast].totalHP - this.byCast[cast].missingHP) / this.byCast[cast].totalHP;
      if(percHP > this.constructor.hpSuggestionThreshold){
        return total + 1;
      }
      return total;
    }, 0) / this.casts;
  }

  get suggestedWasted() {
    return {
      actual: this.wastedCasts,
      isGreaterThanOrEqual: {
        minor: 0.20,
        average: 0.30,
        major: 0.40,
      },
      style: 'number',
    };
  }

  get ineffectiveCasts(){
    const ineffective = Object.keys(this.byCast).reduce((total, cast) => {
      if(this.byCast[cast].overHealing > 0 || this.byCast[cast].targets === this.constructor.maxTargets){
        return total;
      }
      const healPerTarget = this.byCast[cast].healing / this.byCast[cast].targets;
      if(this.byCast[cast].missingHP >= (healPerTarget*0.9)){//if missing health could be at least partially filled with another target at 10% overheal, consider cast ineffective
        return total + 1;
      }
      return total;
    }, 0);
    return ineffective / this.casts;
  }

  get suggestedHitCount() {
    return {
      actual: this.ineffectiveCasts,
      isGreaterThanOrEqual: {
        minor: 0.10,
        average: 0.25,
        major: 0.50,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestedWasted).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Your usage of <ItemLink id={ITEMS.IDOL_OF_INDISCRIMINATE_CONSUMPTION.id} /> can be improved. Try to use it when you are on low health.
        </>
      )
        .icon(ITEMS.IDOL_OF_INDISCRIMINATE_CONSUMPTION.icon)
        .actual(`${formatPercentage(actual)}% of casts at above ${formatPercentage(this.constructor.hpSuggestionThreshold)}% HP.`)
        .recommended(`<20% is recommended`);
    });
    when(this.suggestedHitCount).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Your usage of <ItemLink id={ITEMS.IDOL_OF_INDISCRIMINATE_CONSUMPTION.id} /> can be improved. Try to hit enough targets to heal to full.
        </>
      )
        .icon(ITEMS.IDOL_OF_INDISCRIMINATE_CONSUMPTION.icon)
        .actual(`${formatPercentage(actual)}% of casts could've hit additional targets without causing overhealing.`)
        .recommended(`<10% is recommended`);
    });
  }

}

export default IdolOfIndiscriminateConsumption;
