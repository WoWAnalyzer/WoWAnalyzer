import React from 'react';

import { formatNumber, formatPercentage } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import StatTracker from 'parser/shared/modules/StatTracker';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import ItemDamageTaken from 'interface/ItemDamageTaken';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import MasteryIcon from 'interface/icons/Mastery';
import { TooltipElement } from 'common/Tooltip';
import ItemLink from 'common/ItemLink';

//Example Log: https://www.warcraftlogs.com/reports/vZQfwra1xVK76M4L/#fight=13&source=17
//Second Example Log: https://www.warcraftlogs.com/reports/vZQfwra1xVK76M4L/#fight=13&source=1

class LurkersInsidiousGift extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
  };

  static cooldown = 120; //seconds
  static duration = 30; //seconds
  static maxStacks = 30;

  possibleUptime = 0;
  uses = 0;
  damageTaken = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.LURKERS_INSIDIOUS_GIFT.id);
    if(!this.active) {
      return;
    }
    const item = this.selectedCombatant.getItem(ITEMS.LURKERS_INSIDIOUS_GIFT.id);
    this.masteryRating = calculateSecondaryStatDefault(395, 881, item.itemLevel);
    this.statTracker.add(SPELLS.INSIDIOUS_GIFT.id, {
      mastery: this.masteryRating,
    });
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INSIDIOUS_GIFT_CAST), this._cast);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER).spell(SPELLS.SUFFERING_DAMAGE), this._takeDamage);

    this.abilities.add({
      spell: SPELLS.INSIDIOUS_GIFT_CAST,
      name: ITEMS.LURKERS_INSIDIOUS_GIFT.name,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      cooldown: this.constructor.cooldown,
      castEfficiency: {
        suggestion: true,
      },
    });
  }

  _cast(event){
    this.uses += 1;
    const timeLeft = this.owner.fight.end_time - event.timestamp;
    if(timeLeft < this.constructor.duration * 1000){
      this.possibleUptime += timeLeft;
    }else{
      this.possibleUptime += this.constructor.duration * 1000;
    }
  }

  _takeDamage(event){
    this.damageTaken += (event.amount || 0) + (event.absorbed || 0);
  }

  get possibleUseCount() {
    return Math.ceil(this.owner.fightDuration / (this.constructor.cooldown * 1000));
  }

  get averageStat(){
    return this.masteryRating * this.selectedCombatant.getBuffUptime(SPELLS.INSIDIOUS_GIFT.id) / this.owner.fightDuration;
  }

  get wastedUptime(){
    return (this.possibleUptime - this.selectedCombatant.getBuffUptime(SPELLS.INSIDIOUS_GIFT.id)) / this.possibleUptime;
  }


  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
            Uses: <b>{this.uses}</b> out of <b>{this.possibleUseCount}</b> possible use{this.possibleUseCount !== 1 && <>s</>}<br />
          </>
        )}
      >
        <BoringItemValueText item={ITEMS.LURKERS_INSIDIOUS_GIFT}>
          <MasteryIcon /> {formatNumber(this.averageStat)} <small>average Mastery</small><br />
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
          Your usage of <ItemLink id={ITEMS.LURKERS_INSIDIOUS_GIFT.id} /> can be improved. Try to use it when you will get the most duration out of the mastery buff without having to cancel it (and without losing uses).
        </>,
      )
        .icon(ITEMS.LURKERS_INSIDIOUS_GIFT.icon)
        .actual(`${formatPercentage(actual)}% of buff uptime wasted.`)
        .recommended(`<5.00% of buff uptime wasted is recommended`);
    });
  }

}

export default LurkersInsidiousGift;
