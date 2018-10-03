import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/bfa/enchants';
import { formatDuration, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import ExpandableStatisticBox from 'interface/others/ExpandableStatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

const ENCHANTABLE_SLOTS = {
  15: 'MainHand',
  16: 'OffHand',
};
const MASTERFUL_NAVIGATION_ENCHANT = 5964;
const MAX_STACKS = 4;
const MASTERY_PER_STACK = 50;
const MASTERY_AT_MAX = 600;
const INDEX_FOR_0_STACK_UPTIME = 0;

/**
 * Masterful Navigation
 * Permanently enchant a weapon to sometimes increase Mastery by 50 for 30 sec, stacking up to 5 times. Upon reaching 5 stacks, all stacks are consumed to grant you 600 Mastery for 10 sec.
 *
 * Example: https://www.warcraftlogs.com/reports/1PzGDqayN6ATQJXZ#fight=last&type=auras&source=16
 */
class MasterfulNavigation extends Analyzer {
  buffStacks = [];
  lastStacks = 0;
  lastUpdate = this.owner.fight.start_time;
  getEnchantableGear() {
    return Object.keys(ENCHANTABLE_SLOTS).reduce((obj, slot) => {
      obj[slot] = this.selectedCombatant._getGearItemBySlotId(slot);
      return obj;
    }, {});
  }
  itemHasMasterfulNavigationEnchant(item) {
    return item && item.permanentEnchant === MASTERFUL_NAVIGATION_ENCHANT;
  }
  hasMasterfulNavigationEnchant() {
    const items = this.getEnchantableGear();
    return Object.values(items).some(item => this.itemHasMasterfulNavigationEnchant(item));
  }
  constructor(...args) {
    super(...args);
    this.active = this.hasMasterfulNavigationEnchant();
    this.buffStacks = Array.from({ length: MAX_STACKS + 1 }, x => [0]);
  }
  handleStacks(event, stack = null) {
    if (event.type === 'removebuff' || isNaN(event.stack)) { //NaN check if player is dead during on_finish
      event.stack = 0;
    }
    if (event.type === 'applybuff') {
      event.stack = 1;
    }
    if (stack) {
      event.stack = stack;
    }
    this.buffStacks[this.lastStacks].push(event.timestamp - this.lastUpdate);
    this.lastUpdate = event.timestamp;
    this.lastStacks = event.stack;
  }
  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.MASTERFUL_NAVIGATION_BUFF_SMALL.id) {
      return;
    }
    this.handleStacks(event);
  }
  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid !== SPELLS.MASTERFUL_NAVIGATION_BUFF_SMALL.id) {
      return;
    }
    this.handleStacks(event);
  }
  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.MASTERFUL_NAVIGATION_BUFF_SMALL.id) {
      return;
    }
    this.handleStacks(event);
  }
  on_byPlayer_removebuffstack(event) {
    if (event.ability.guid !== SPELLS.MASTERFUL_NAVIGATION_BUFF_SMALL.id) {
      return;
    }
    this.handleStacks(event);
  }
  on_finished(event) {
    this.handleStacks(event, this.lastStacks);
    this.buffStacks[INDEX_FOR_0_STACK_UPTIME].push(-this.maxStackBuffUptime()); //We lower 0 stack uptime by the amount of uptime we have on the big buff, as you cannot start stacking the small buff before the large one has fallen off.
  }
  maxStackBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.MASTERFUL_NAVIGATION_BUFF_BIG.id);
  }
  get averageMastery() {
    let averageStacks = 0;
    this.buffStacks.forEach((durations, stackSize) => {
      averageStacks += durations.reduce((totalDuration, duration) => totalDuration + duration) / this.owner.fightDuration * stackSize;
    });
    const maxStackUptimePercentage = this.maxStackBuffUptime() / this.owner.fightDuration;
    return (averageStacks * MASTERY_PER_STACK + maxStackUptimePercentage * MASTERY_AT_MAX).toFixed(2);
  }
  item() {
    const tooltipData = (
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.MASTERFUL_NAVIGATION_BUFF_SMALL.id} />}
        value={`${this.averageMastery}`}
        label="average mastery gained"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Mastery-Bonus</th>
              <th>Time (s)</th>
              <th>Time (%)</th>
            </tr>
          </thead>
          <tbody>
            {this.buffStacks.map((buffUptime, stacks) => (
              <tr key={stacks}>
                <th>{(stacks * MASTERY_PER_STACK).toFixed(0)}</th>
                <td>{formatDuration(buffUptime.reduce((sum, current) => sum + current, 0) / 1000)}</td>
                <td>{formatPercentage(buffUptime.reduce((sum, current) => sum + current, 0) / this.owner.fightDuration)}%</td>
              </tr>
            ))}
            <tr key={this.buffStacks.length + 1}>
              <th>{MASTERY_AT_MAX}</th>
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

export default MasterfulNavigation;
