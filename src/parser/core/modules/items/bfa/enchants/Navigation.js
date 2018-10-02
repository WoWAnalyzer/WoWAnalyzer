import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import ExpandableStatisticBox from 'interface/others/ExpandableStatisticBox';
import SpellIcon from 'common/SpellIcon';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { formatDuration, formatPercentage } from 'common/format';

/**
 * Navigation Enchants
 * Permanently enchant a weapon to sometimes increase <stat> by 50 for 30 sec, stacking up to 5 times. Upon reaching 5 stacks, all stacks are consumed to grant you 600 <stat> for 10 sec.
 */
class Navigation extends Analyzer {
  enchantableSlots = {
    15: 'MainHand',
    16: 'OffHand',
  };
  enchantToTrack = null;
  smallBuffToTrack = null;
  bigBuffToTrack = null;
  primairyStat = "";
  statPerStack = 50;
  statAtMax = 600;

  buffStacks = {};
  getEnchantableGear() {
    return Object.keys(this.enchantableSlots).reduce((obj, slot) => {
      obj[slot] = this.selectedCombatant._getGearItemBySlotId(slot);
      return obj;
    }, {});
  }
  itemHasTrackedEnchant(item) {
    return item && item.permanentEnchant === this.enchantToTrack;
  }
  hasTrackedEnchant() {
    const items = this.getEnchantableGear();
    return Object.values(items).some(item => this.itemHasTrackedEnchant(item));
  }
  on_byPlayer_changebuffstack(event) {
    if (event.ability.guid !== this.smallBuffToTrack) {
      return;
    }

    this.buffStacks[event.start] = event.stackHistory;
  }

  get cleanStacks() {
    const cleanStacks = {
      0: [
        {
          start: this.owner.fight.start_time,
        },
      ],
    };
    let lastHandledStack = 0;

    Object.values(this.buffStacks).forEach((stackChain) => {
      stackChain.forEach((stack) => {
        const stackSize = stack.stacks;
        const stackStart = stack.timestamp;

        if (cleanStacks.hasOwnProperty(lastHandledStack)) {
          const previousStack = cleanStacks[lastHandledStack];
          const lastOccurrence = previousStack[previousStack.length - 1];
          if (!(lastOccurrence.hasOwnProperty('end'))) {
            lastOccurrence.end = stackStart;
            lastOccurrence.duration = lastOccurrence.end - lastOccurrence.start;
          }
        }

        if (!(cleanStacks.hasOwnProperty(stackSize))) {
          cleanStacks[stackSize] = [];
        }

        const stackInfo = {
          start: stackStart,
        };
        cleanStacks[stackSize].push(stackInfo);
        lastHandledStack = stackSize;
      });
    });

    if (cleanStacks.hasOwnProperty(lastHandledStack)) {
      const previousStack = cleanStacks[lastHandledStack];
      const lastOccurrence = previousStack[previousStack.length - 1];
      if (!(lastOccurrence.hasOwnProperty('end'))) {
        lastOccurrence.end = this.owner.fight.end_time;
        lastOccurrence.duration = lastOccurrence.end - lastOccurrence.start;
      }
    }

    return cleanStacks;
  }
  maxStackBuffUptime() {
    return this.selectedCombatant.getBuffUptime(this.bigBuffToTrack);
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
    return (averageStacks * this.statPerStack + maxStackUptimePercentage * this.statAtMax).toFixed(2);
  }
  item() {
    const buffStacks = this.cleanStacks;
    const tooltipData = (
      <ExpandableStatisticBox
        icon={<SpellIcon id={this.smallBuffToTrack} />}
        value={`${this.averageStat}`}
        label={`average ${this.primairyStat} gained`}
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>{this.primairyStat}-Bonus</th>
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

                return (
                  <tr key={stackSize}>
                    <th>{(stackSize * this.statPerStack).toFixed(0)}</th>
                    <td>{formatDuration(totalStackDuration / 1000)}</td>
                    <td>{formatPercentage(totalStackDuration / this.owner.fightDuration)}%</td>
                  </tr>
                );
              })
            }
            <tr key="max">
              <th>{this.statAtMax}</th>
              <td>{formatDuration(this.maxStackBuffUptime() / 1000)}</td>
              <td>{formatPercentage(this.maxStackBuffUptime() / this.owner.fightDuration)}%</td>
            </tr>
          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
    return tooltipData;
  }
}
export default Navigation;
