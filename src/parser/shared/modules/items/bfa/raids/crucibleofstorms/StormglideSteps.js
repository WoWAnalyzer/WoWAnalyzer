import React from 'react';

import { calculateSecondaryStatDefault } from 'common/stats';

import ITEMS from 'common/ITEMS/index';
import SPELLS from 'common/SPELLS/index';

import Analyzer from 'parser/core/Analyzer';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import StatTracker from 'parser/shared/modules/StatTracker';

import { formatNumber, formatPercentage, formatDuration } from 'common/format';

import CriticalStrikeIcon from 'interface/icons/CriticalStrike';
import UptimeIcon from 'interface/icons/Uptime';

// https://www.warcraftlogs.com/reports/RDHTGY68yPQ3WJ9r#fight=28source=14

class StormglideSteps extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasFeet(ITEMS.STORMGLIDE_STEPS.id);
    if(!this.active){
      return;
    }

    const item = this.selectedCombatant.feet;
    this.critRating = calculateSecondaryStatDefault(395, 20, item.itemLevel);
    this.statTracker.add(SPELLS.UNTOUCHABLE.id, {
      crit: this.critRating,
    });
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.UNTOUCHABLE.id) / this.owner.fightDuration;
  }

  get averageStacks() {
    return (this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.UNTOUCHABLE.id) / this.owner.fightDuration);
  }

  get averageStat() {
    return this.critRating * this.averageStacks;
  }

  statistic() {
    const buffStacks = this.selectedCombatant.getStackBuffUptimes(SPELLS.UNTOUCHABLE.id);
    const maxStacks = Object.keys(buffStacks)
    .map(stacks => parseInt(stacks,10) || 0) //convert keys to integers
    .reduce((a,b) => a > b ? a : b, 0); //find the largest key (aka highest stack)
    const maxStackDuration = buffStacks[maxStacks] || 0;
    const unbuffedDuration = buffStacks[0] || 0;
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
          Average stacks: <b>{this.averageStacks.toFixed(1)}</b><br />
          Time spent at <b>0</b> stacks: <b>{formatDuration(unbuffedDuration / 1000)}</b> ({formatPercentage(unbuffedDuration / this.owner.fightDuration)}%)<br />
          {maxStacks !== 0 && <> Time spent at <b>{maxStacks}</b> stack{maxStacks !== '1' && `s`}: <b>{formatDuration(maxStackDuration / 1000)}</b> ({formatPercentage(maxStackDuration / this.owner.fightDuration)}%)</>}
          </>
        )}
      >
        <BoringItemValueText item={ITEMS.STORMGLIDE_STEPS}>
          <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>buff uptime</small><br />
          <CriticalStrikeIcon /> {formatNumber(this.averageStat)} <small>average Critical Strike</small><br />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }

}

export default StormglideSteps;
