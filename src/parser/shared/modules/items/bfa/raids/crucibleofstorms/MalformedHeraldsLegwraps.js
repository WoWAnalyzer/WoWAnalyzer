import React from 'react';

import { formatNumber, formatPercentage } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';

import ITEMS from 'common/ITEMS/index';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import ItemDamageTaken from 'interface/others/ItemDamageTaken';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import StatTracker from 'parser/shared/modules/StatTracker';
import { TooltipElement } from 'common/Tooltip';
import HasteIcon from 'interface/icons/Haste';
import UptimeIcon from 'interface/icons/Uptime';
import ItemLink from 'common/ItemLink';

// Example log: https://www.warcraftlogs.com/reports/GD6xT8JwbzHqYF3j#fight=22&source=33

class MalformedHeraldsLegwraps extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
  };

  static duration = 12; //seconds
  static cooldown = 60; //seconds

  damageTaken = 0;
  casts = 0;
  possibleUptime = 0;
  endedEarly = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasLegs(ITEMS.MALFORMED_HERALDS_LEGWRAPS.id);

    if(!this.active){
      return;
    }

    const item = this.selectedCombatant.getItem(ITEMS.MALFORMED_HERALDS_LEGWRAPS.id);
    this.hasteRating = calculateSecondaryStatDefault(395, 534, item.itemLevel);
    this.statTracker.add(SPELLS.VOID_EMBRACE.id, {
      haste: this.hasteRating,
    });

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VOID_EMBRACE), this._cast);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER).spell(SPELLS.VOID_BACKLASH), this._damageTaken);

    this.abilities.add({
      spell: SPELLS.VOID_EMBRACE,
      name: ITEMS.MALFORMED_HERALDS_LEGWRAPS.name,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      cooldown: this.constructor.cooldown,
      castEfficiency: {
        suggestion: true,
      },
    });
  }

  _cast(event){
    this.casts += 1;
    const timeLeft = this.owner.fight.end_time - event.timestamp;
    if(timeLeft < this.constructor.duration * 1000){
      this.possibleUptime += timeLeft;
    }else{
      this.possibleUptime += this.constructor.duration * 1000;
    }
  }

  _damageTaken(event){
    this.damageTaken += (event.amount || 0);
    this.endedEarly += 1;
  }

  get buffUptime(){
    return this.selectedCombatant.getBuffUptime(SPELLS.VOID_EMBRACE.id) / this.owner.fightDuration;
  }

  get averageHaste(){
    return this.buffUptime * this.hasteRating;
  }

  get wastedUptime(){
    return (this.possibleUptime - this.selectedCombatant.getBuffUptime(SPELLS.VOID_EMBRACE.id)) / this.possibleUptime;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
          Average buff duration: <b>{this.constructor.duration * (this.selectedCombatant.getBuffUptime(SPELLS.VOID_EMBRACE.id) / this.possibleUptime)}s</b><br />
          Buffs ended early: <b>{this.endedEarly}</b> out of <b>{this.casts}</b><br />
          </>
        )}
      >
        <BoringItemValueText item={ITEMS.MALFORMED_HERALDS_LEGWRAPS}>
          <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>buff uptime</small><br />
          <HasteIcon /> {formatNumber(this.averageHaste)} <small>average Haste gained</small><br />
          <TooltipElement content={`Damage taken: ${formatNumber(this.damageTaken)}`}>
            <ItemDamageTaken amount={this.damageTaken} />
          </TooltipElement>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }

  get suggestedUptime() {
    return {
      actual: this.wastedUptime,
      isGreaterThan: {
        minor: 0.05,
        average: 0.08,
        major: 0.1,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestedUptime).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Your usage of <ItemLink id={ITEMS.MALFORMED_HERALDS_LEGWRAPS.id} /> can be improved. Try to use it when you will get the most duration out of the haste buff without having to step out of it (and without losing uses).
        </>
      )
        .icon(ITEMS.MALFORMED_HERALDS_LEGWRAPS.icon)
        .actual(`${formatPercentage(actual)}% of buff uptime wasted.`)
        .recommended(`<5.00% of buff uptime wasted is recommended`);
    });
  }

}

export default MalformedHeraldsLegwraps;
