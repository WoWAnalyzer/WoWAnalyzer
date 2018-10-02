import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import ExpandableStatisticBox from 'interface/others/ExpandableStatisticBox';
import SpellIcon from 'common/SpellIcon';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { formatDuration, formatPercentage } from 'common/format';

const MS_BUFFER = 100;

/**
 * Navigation Enchants
 * Permanently enchant a weapon to sometimes increase <stat> by 50 for 30 sec, stacking up to 5 times. Upon reaching 5 stacks, all stacks are consumed to grant you 600 <stat> for 10 sec.
 */
class Navigation extends Analyzer {
  static enchantableSlots = {
    15: 'MainHand',
    16: 'OffHand',
  };
  static enchantId = null;
  static smallBuffId = null;
  static bigBuffId = null;
  static primaryStat = "";
  static statPerStack = 50;
  static statAtMax = 600;

  buffStacks = {};
  getEnchantableGear() {
    return Object.keys(this.constructor.enchantableSlots).reduce((obj, slot) => {
      obj[slot] = this.selectedCombatant._getGearItemBySlotId(slot);
      return obj;
    }, {});
  }
  itemHasTrackedEnchant(item) {
    return item && item.permanentEnchant === this.constructor.enchantId;
  }
  hasTrackedEnchant() {
    const items = this.getEnchantableGear();
    return Object.values(items).some(item => this.itemHasTrackedEnchant(item));
  }
  constructor(...args) {
    super(...args);
    this.active = this.hasTrackedEnchant();
  }
  on_byPlayer_changebuffstack(event) {
    if (event.ability.guid !== this.constructor.smallBuffId) {
      return;
    }

    this.buffStacks[event.start] = event.stackHistory;
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

    Object.values(this.buffStacks).forEach((stackChain) => {
      stackChain.forEach((stack) => {
        const stackSize = stack.stacks;
        const stackStart = stack.timestamp;
        if (cleanStacks[lastHandledStack]) {
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
  maxStackBuffUptime() {
    return this.selectedCombatant.getBuffUptime(this.constructor.bigBuffId);
  }
  get averageStat() {
    let averageStacks = 0;
    const buffStacks = this.cleanStacks;

    Object.keys(buffStacks).forEach((stackSize) => {
      let totalStackDuration = 0;
      buffStacks[stackSize].forEach((occurrence) => {
        totalStackDuration += occurrence.duration;
      });
      averageStacks += totalStackDuration / this.owner.fightDuration * stackSize;
    });
    const maxStackUptimePercentage = this.maxStackBuffUptime() / this.owner.fightDuration;
    return ((averageStacks * this.constructor.statPerStack) + (maxStackUptimePercentage * this.constructor.statAtMax)).toFixed(2);
  }
  item() {
    const buffStacks = this.cleanStacks;
    const maxStackBuffDuration = this.maxStackBuffUptime();
    const tooltipData = (
      <ExpandableStatisticBox
        icon={<SpellIcon id={this.constructor.smallBuffId} />}
        value={`${this.averageStat}`}
        label={`average ${this.constructor.primaryStat} gained`}
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>{this.constructor.primaryStat}-Bonus</th>
              <th>Time (s)</th>
              <th>Time (%)</th>
            </tr>
          </thead>
          <tbody>
            {
              Object.keys(buffStacks).map((stackSize) => {
                let totalStackDuration = 0;
                buffStacks[stackSize].forEach((occurrence) => {
                  totalStackDuration += occurrence.duration;
                });
                if (stackSize === '0'){
                  totalStackDuration -= maxStackBuffDuration;
                }

                return (
                  <tr key={stackSize}>
                    <th>{(stackSize * this.constructor.statPerStack).toFixed(0)}</th>
                    <td>{formatDuration(totalStackDuration / 1000)}</td>
                    <td>{formatPercentage(totalStackDuration / this.owner.fightDuration)}%</td>
                  </tr>
                );
              })
            }
            <tr key="max">
              <th>{this.constructor.statAtMax}</th>
              <td>{formatDuration(maxStackBuffDuration / 1000)}</td>
              <td>{formatPercentage(maxStackBuffDuration / this.owner.fightDuration)}%</td>
            </tr>
          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
    return tooltipData;
  }
}
export default Navigation;
