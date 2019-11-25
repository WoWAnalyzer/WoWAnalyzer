import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage, formatNumber } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import UptimeIcon from 'interface/icons/Uptime';
import HasteIcon from 'interface/icons/Haste';
import MasteryIcon from 'interface/icons/Mastery';
import CriticalStrikeIcon from 'interface/icons/CriticalStrike';
import Analyzer from 'parser/core/Analyzer';

/**
 * Harlan's Loaded Dice
 * Your attacks and abilities have a chance to roll the loaded dice, gaining a random combination of Mastery, Haste, and Critical Strike for 15 sec.
 *
 * Example: /report/ABH7D8W1Qaqv96mt/2-Mythic+Taloc+-+Kill+(4:12)/Feloozie/statistics
 */
class HarlansLoadedDice extends Analyzer {
  _item = null;
  smallBuffValue = 0;
  bigBuffValue = 0;

  smallBuffs = [
    SPELLS.LOADED_DIE_CRITICAL_STRIKE_SMALL.id,
    SPELLS.LOADED_DIE_HASTE_SMALL.id,
    SPELLS.LOADED_DIE_MASTERY_SMALL.id,
  ];

  bigBuffs = [
    SPELLS.LOADED_DIE_MASTERY_BIG.id,
    SPELLS.LOADED_DIE_CRITICAL_STRIKE_BIG.id,
    SPELLS.LOADED_DIE_HASTE_BIG.id,
  ];

  constructor(...args) {
    super(...args);
    this._item = this.selectedCombatant.getTrinket(ITEMS.HARLANS_LOADED_DICE.id);
    this.active = !!this._item;
    if (this.active) {
      this.smallBuffValue = calculateSecondaryStatDefault(355, 169, this.selectedCombatant.getItem(ITEMS.HARLANS_LOADED_DICE.id).itemLevel);
      this.bigBuffValue = calculateSecondaryStatDefault(355, 284, this.selectedCombatant.getItem(ITEMS.HARLANS_LOADED_DICE.id).itemLevel);
    }
  }
  get bigBuffUptime() {
    return this.bigBuffs.reduce((a, b) => a + this.selectedCombatant.getBuffUptime(b), 0) / 3 / this.owner.fightDuration;
  }
  get smallBuffUptime() {
    return this.smallBuffs.reduce((a, b) => a + this.selectedCombatant.getBuffUptime(b), 0) / 3 / this.owner.fightDuration;
  }
  get totalBuffUptime() {
    return (this.bigBuffUptime + this.smallBuffUptime);
  }

  getAverageCrit() {
    return (this.selectedCombatant.getBuffUptime(SPELLS.LOADED_DIE_CRITICAL_STRIKE_BIG.id) * this.bigBuffValue + this.selectedCombatant.getBuffUptime(SPELLS.LOADED_DIE_CRITICAL_STRIKE_SMALL.id) * this.smallBuffValue) / this.owner.fightDuration;
  }
  getAverageHaste() {
    return (this.selectedCombatant.getBuffUptime(SPELLS.LOADED_DIE_HASTE_BIG.id) * this.bigBuffValue + this.selectedCombatant.getBuffUptime(SPELLS.LOADED_DIE_HASTE_SMALL.id) * this.smallBuffValue) / this.owner.fightDuration;
  }
  getAverageMastery() {
    return (this.selectedCombatant.getBuffUptime(SPELLS.LOADED_DIE_MASTERY_BIG.id) * this.bigBuffValue + this.selectedCombatant.getBuffUptime(SPELLS.LOADED_DIE_MASTERY_SMALL.id) * this.smallBuffValue) / this.owner.fightDuration;
  }

  buffTriggerCount() { //Either the big buff or the small buff will be applied on a proc, so just counting the mastery gets total amount of procs.
    return this.selectedCombatant.getBuffTriggerCount(SPELLS.LOADED_DIE_MASTERY_SMALL.id) + this.selectedCombatant.getBuffTriggerCount(SPELLS.LOADED_DIE_MASTERY_BIG.id);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.HARLANS_LOADED_DICE}>
          <UptimeIcon /> {formatPercentage(this.totalBuffUptime, 0)}% <small>uptime</small> <br />
          <HasteIcon /> {formatNumber(this.getAverageHaste())} <small>average Haste gained</small> <br />
          <CriticalStrikeIcon /> {formatNumber(this.getAverageCrit())} <small>average Crit gained</small> <br />
          <MasteryIcon /> {formatNumber(this.getAverageMastery())} <small>average Mastery gained</small>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default HarlansLoadedDice;
