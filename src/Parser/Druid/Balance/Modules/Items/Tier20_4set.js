import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import { formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';

const HASTE_BONUS = 0.02;

/**
 * Balance Druid Tier20 4set
 * Casting Starsurge or Starfall gives 2% haste for 15 seconds, stacking up to 4 times (duration is not refreshed).
 */
class Tier20_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  lastProcc = null;
  totalProccValue = [];
  currentUptime = 0;
  currentProccValue = 0;

  on_initialized() {
	this.active = this.combatants.selected.hasBuff(SPELLS.BALANCE_DRUID_T20_4SET_BONUS_BUFF.id);
  }

  on_byPlayer_changebuffstack(event) {
    if (event.ability.guid !== SPELLS.ASTRAL_ACCELERATION.id) {
      return;
    }
    if(this.lastProcc == null) {
      this.lastProcc = event.timestamp;
    } else {
      this.currentUptime += event.timestamp - this.lastProcc;
      this.currentProccValue = event.oldStacks * HASTE_BONUS;
      this.lastProcc = event.timestamp;

      if(event.newStacks === 0) {
        // Buff has fallen off, sum it up
        this.totalProccValue.push([this.currentProccValue, this.currentUptime]);

        this.currentProccValue = 0;
        this.currentUptime = 0;
        this.lastProcc = null;
      }
    }
  }

  get averageHaste(){
    return this.totalProccValue.reduce((acc, proc) => acc + (proc[0] * proc[1]), 0) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.averageHaste,
      isLessThan: {
        minor: 0.06,
        average: 0.05,
        major: 0.04,
      },
      style: 'number',
    };
  }
  
  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Your <SpellLink id={SPELLS.BALANCE_DRUID_T20_4SET_BONUS_BUFF.id} /> gave you an average of {formatPercentage(actual)}% haste. Try to get more out of this set bonus by pooling Astral Power when at max stacks or when the buff is about to expire and spending it as soon as possible when the buff drops off.</Wrapper>)
        .icon(SPELLS.BALANCE_DRUID_T20_4SET_BONUS_BUFF.icon)
        .actual(`${formatPercentage(actual)}% uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  item() {
    return {
      id: SPELLS.BALANCE_DRUID_T20_4SET_BONUS_BUFF.id,
      icon: <SpellIcon id={SPELLS.BALANCE_DRUID_T20_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.BALANCE_DRUID_T20_4SET_BONUS_BUFF.id} />,
      result: <Wrapper>{formatPercentage(this.averageHaste)} % average haste gained.</Wrapper>,
    };
  }
}

export default Tier20_4set;
