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
const QUICK_NAVIGATION_ENCHANT = 5963;
const MAX_STACKS = 5;
const HASTE_PER_STACK = 50;
const HASTE_AT_MAX = 600;
/**
 * Quick Navigation
 * Permanently enchant a weapon to sometimes increase Haste by 50 for 30 sec, stacking up to 5 times. Upon reaching 5 stacks, all stacks are consumed to grant you 600 Haste for 10 sec.
 *
 * Example: https://www.warcraftlogs.com/reports/j7XQrN8LcJKw1qM3#fight=29&type=auras&view=timeline&target=36
 */
class QuickNavigation extends Analyzer {
  buffStacks = [];
  lastStacks = 0;
  lastUpdate = this.owner.fight.start_time;
  getEnchantableGear() {
    return Object.keys(ENCHANTABLE_SLOTS).reduce((obj, slot) => {
      obj[slot] = this.selectedCombatant._getGearItemBySlotId(slot);
      return obj;
    }, {});
  }
  itemHasQuickNavigationEnchant(item) {
    return item && item.permanentEnchant === QUICK_NAVIGATION_ENCHANT;
  }
  hasQuickNavigationEnchant() {
    const items = this.getEnchantableGear();
    return Object.values(items).some(item => this.itemHasQuickNavigationEnchant(item));
  }
  constructor(...args) {
    super(...args);
    this.active = this.hasQuickNavigationEnchant();
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
    if (event.ability.guid !== SPELLS.QUICK_NAVIGATION_BUFF_SMALL.id) {
      return;
    }
    this.handleStacks(event);
  }
  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid !== SPELLS.QUICK_NAVIGATION_BUFF_SMALL.id) {
      return;
    }
    this.handleStacks(event);
  }
  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.QUICK_NAVIGATION_BUFF_SMALL.id) {
      return;
    }
    this.handleStacks(event);
  }
  on_byPlayer_removebuffstack(event) {
    if (event.ability.guid !== SPELLS.QUICK_NAVIGATION_BUFF_SMALL.id) {
      return;
    }
    this.handleStacks(event);
  }
  on_finished(event) {
    this.handleStacks(event, this.lastStacks);
  }
  maxStackBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.QUICK_NAVIGATION_BUFF_BIG.id);
  }
  get averageHaste() {
    let averageStacks = 0;
    this.buffStacks.forEach((durations, stackSize) => {
      averageStacks += durations.reduce((totalDuration, duration) => totalDuration + duration) / this.owner.fightDuration * stackSize;
    });
    const maxStackUptimePercentage = this.maxStackBuffUptime() / this.owner.fightDuration;
    return (averageStacks * HASTE_PER_STACK + maxStackUptimePercentage * HASTE_AT_MAX).toFixed(2);
  }
  item() {
    const tooltipData = (
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.QUICK_NAVIGATION_BUFF_SMALL.id} />}
        value={`${this.averageHaste}`}
        label="average haste gained"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Haste-Bonus</th>
              <th>Time (s)</th>
              <th>Time (%)</th>
            </tr>
          </thead>
          <tbody>
            {this.buffStacks.map((e, i) => (
              <tr key={i}>
                <th>{(i * HASTE_PER_STACK).toFixed(0)}</th>
                <td>{formatDuration(e.reduce((a, b) => a + b, 0) / 1000)}</td>
                <td>{formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%</td>
              </tr>
            ))}
            <tr key={this.buffStacks.length + 1}>
              <th>{HASTE_AT_MAX}</th>
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
export default QuickNavigation;
