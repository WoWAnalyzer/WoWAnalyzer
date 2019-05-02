import React from 'react';

import { calculatePrimaryStat } from 'common/stats';
import { formatNumber, formatPercentage } from 'common/format';

import ITEMS from 'common/ITEMS/index';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import StatTracker from 'parser/shared/modules/StatTracker';

import PrimaryStatIcon from 'interface/icons/PrimaryStat';
import UptimeIcon from 'interface/icons/Uptime';

const MS_BUFFER = 100;

// Example log: https://www.warcraftlogs.com/reports/6xHLtAFW4yC73mRD/#fight=28&source=2

class TridentOfDeepOcean extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  static shieldDuration = 40;

  damageAbsorbed = 0;
  shieldCount = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasMainHand(ITEMS.TRIDENT_OF_DEEP_OCEAN.id);
    if(!this.active){
      return;
    }

    this.addEventListener(Events.absorbed.to(SELECTED_PLAYER).spell(SPELLS.CUSTODY_OF_THE_DEEP_SHIELD), this._absorbDamage);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.CUSTODY_OF_THE_DEEP_SHIELD), this._applyShield);
    this.addEventListener(Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.CUSTODY_OF_THE_DEEP_SHIELD), this._applyShield);

    const item = this.selectedCombatant.mainHand;
    this.mainstatRating = calculatePrimaryStat(395, 181, item.itemLevel);
    this.statTracker.add(SPELLS.CUSTODY_OF_THE_DEEP_BUFF.id, {
      agility: this.mainstatRating,
      strength: this.mainstatRating,
      intellect: this.mainstatRating,
    });
  }

  _applyShield(event){
    this.shieldCount++;
  }

  isBuggedStackChange(previousTime, currentTime){
    return previousTime > (currentTime - MS_BUFFER);
  }

  get cleanStacks() {
    const cleanStacks = {
      0: [
        {
          start: this.owner.fight.start_time,
          end: null,
          duration: null,
        },
      ],
    };
    let lastHandledStack = 0;

    const buffStacks = this.selectedCombatant.getBuffHistory(SPELLS.CUSTODY_OF_THE_DEEP_BUFF.id).reduce((obj, buff) => {
      obj[buff.start] = buff.stackHistory;
      return obj;
    }, {});

    Object.values(buffStacks).forEach((stackChain) => {
      stackChain.forEach((stack) => {
        const stackSize = stack.stacks;
        const stackStart = stack.timestamp;
        if (cleanStacks[lastHandledStack] !== undefined) {
          const previousStack = cleanStacks[lastHandledStack];
          const lastOccurrence = previousStack[previousStack.length - 1];
          if (this.isBuggedStackChange(lastOccurrence.start, stackStart)){
            return;
          }

          if (lastOccurrence.end === null) {
            lastOccurrence.end = stackStart;
            lastOccurrence.duration = lastOccurrence.end - lastOccurrence.start;
          }
        }

        if (cleanStacks[stackSize] === undefined) {
          cleanStacks[stackSize] = [];
        }

        const stackInfo = {
          start: stackStart,
          end: null,
          duration: null,
        };
        cleanStacks[stackSize].push(stackInfo);
        lastHandledStack = stackSize;
      });
    });

    if (cleanStacks[lastHandledStack]) {
      const previousStack = cleanStacks[lastHandledStack];
      const lastOccurrence = previousStack[previousStack.length - 1];
      if (lastOccurrence.end === null) {
        lastOccurrence.end = this.owner.fight.end_time;
        lastOccurrence.duration = lastOccurrence.end - lastOccurrence.start;
      }
    }

    return cleanStacks;
  }

  _absorbDamage(event){
    this.damageAbsorbed += (event.amount || 0);
  }

  get mainstatUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.CUSTODY_OF_THE_DEEP_BUFF.id)/this.owner.fightDuration;
  }

  get shieldUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.CUSTODY_OF_THE_DEEP_SHIELD.id)/this.owner.fightDuration;
  }

  get averageMainStat() {
    const buffStacks = this.cleanStacks;

    const buffDuration = Object.keys(buffStacks).reduce((total, stackSize) => {
      const totalStackDuration = buffStacks[stackSize]
        .map(element => element.duration)
        .reduce((total, current) => total + current);

      return total + (totalStackDuration * stackSize);
    }, 0);

    const buffIncrease = buffDuration * this.mainstatRating;

    return (buffIncrease / this.owner.fightDuration).toFixed(0);
  }

  get averageShieldDuration() {
    return this.selectedCombatant.getBuffUptime(SPELLS.CUSTODY_OF_THE_DEEP_SHIELD.id) / (this.shieldCount * 1000);
  }

  statistic() {
    const buffStacks = this.cleanStacks;
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
            Shield procs: <b>{this.shieldCount}</b> <br />
            On average, the shield lasted for <b>{formatPercentage(this.averageShieldDuration / this.constructor.shieldDuration)} %</b> of its maximum duration. <br />
            Total amount absorbed: <b>{formatNumber(this.damageAbsorbed)}</b> <br />
            You spent: <br />
            <ul>
            {
              Object.keys(buffStacks).map((stackSize) => {
                const totalStackDuration = buffStacks[stackSize]
                  .map(element => element.duration)
                  .reduce((total, current) => total + current);
                  return (
                    <li>
                      <b>{(totalStackDuration / 1000).toFixed(0)}s</b> ({formatPercentage(totalStackDuration / this.owner.fightDuration)}%) at <b>{stackSize}</b> stack{stackSize !== '1' && `s`}.
                    </li>
                  );
                })
              }
            </ul>
          </>
        )}
      >
        <BoringItemValueText item={ITEMS.TRIDENT_OF_DEEP_OCEAN}>
          <UptimeIcon /> {formatPercentage(this.mainstatUptime)}% <small>buff uptime</small><br />
          <PrimaryStatIcon stat={this.selectedCombatant.spec.primaryStat} /> {formatNumber(this.averageMainStat)} <small>average {this.selectedCombatant.spec.primaryStat} gained</small><br />
          <ItemHealingDone amount={this.damageAbsorbed} />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }

}

export default TridentOfDeepOcean;
