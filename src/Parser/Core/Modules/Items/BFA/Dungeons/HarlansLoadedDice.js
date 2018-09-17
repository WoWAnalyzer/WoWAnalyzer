import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import { formatPercentage, formatNumber } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';

/**
 * Harlan's Loaded Dice
 * Your attacks and abilities have a chance to roll the loaded dice, gaining a random combination of Mastery, Haste, and Critical Strike for 15 sec.
 *
 * Example: https://www.warcraftlogs.com/reports/LR2jNyrk3GmPXgZ9#fight=4&type=auras&source=5

 */
class GalecallersBoon extends Analyzer {
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
    this.active = this.selectedCombatant.hasTrinket(ITEMS.HARLANS_LOADED_DICE.id);
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

  item() {
    return {
      item: ITEMS.HARLANS_LOADED_DICE,
      result: (
        <dfn data-tip={`
        <ul>
          <li>Procced ${this.buffTriggerCount()} times.</li>
          <li>You had an uptime of ${formatPercentage(this.smallBuffUptime)}% on the small buffs.</li>
          <li> You had an uptime of ${formatPercentage(this.bigBuffUptime)}% on the large buffs.</li>
        </ul>`}>
          {formatPercentage(this.totalBuffUptime)}% uptime<br />
          {formatNumber(this.getAverageHaste())} average Haste<br />
          {formatNumber(this.getAverageCrit())} average Crit<br />
          {formatNumber(this.getAverageMastery())} average Mastery
        </dfn>
      ),
    };
  }
}

export default GalecallersBoon;
