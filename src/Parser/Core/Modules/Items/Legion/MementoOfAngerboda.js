import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
 * Memento of Angerboda
 * Equip: Your melee attacks have a chance to activate Screams of the Dead, granting you a random combat enhancement for 8 sec.
 */

/*
 * The three buffs are:
 * Howl of Ingvar - Crit Buff
 * Wail of Svala - Haste Buff
 * Dirge of Angerboda - Mastery Buff
 * 845 ilvl = 4207 stat
 */

class MementoOfAngerboda extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  statBuff = 0;

  critStatProc = 0;
  hasteStatProc = 0;
  masteryStatProc = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.MEMENTO_OF_ANGERBODA.id);
    if (this.active) {
      this.statBuff = calculateSecondaryStatDefault(845, 4207, this.combatants.selected.getItem(ITEMS.MEMENTO_OF_ANGERBODA.id).itemLevel);
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    switch (spellId) {
      case SPELLS.DIRGE_OF_ANGERBODA.id:
        this.masteryStatProc++;
        break;
      case SPELLS.HOWL_OF_INGVAR.id:
        this.critStatProc++;
        break;
      case SPELLS.WAIL_OF_SVALA.id:
        this.hasteStatProc++;
        break;
      default:
        break;
    } 
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    switch (spellId) {
      case SPELLS.DIRGE_OF_ANGERBODA.id:
        this.masteryStatProc++;
        break;
      case SPELLS.HOWL_OF_INGVAR.id:
        this.critStatProc++;
        break;
      case SPELLS.WAIL_OF_SVALA.id:
        this.hasteStatProc++;
        break;
      default:
        break;
    }
  }

  item() {
    const critUptime = this.combatants.selected.getBuffUptime(SPELLS.HOWL_OF_INGVAR.id) / this.owner.fightDuration;
    const hasteUptime = this.combatants.selected.getBuffUptime(SPELLS.WAIL_OF_SVALA.id) / this.owner.fightDuration;
    const masteryUptime = this.combatants.selected.getBuffUptime(SPELLS.DIRGE_OF_ANGERBODA.id) / this.owner.fightDuration;

    const averageCrit = critUptime * this.statBuff;
    const averageHaste = hasteUptime * this.statBuff;
    const averageMastery = masteryUptime * this.statBuff;

    return {
      item: ITEMS.MEMENTO_OF_ANGERBODA,
      result: (
        <div>
          <dfn data-tip={`Proced the Crit stat buff <b>${this.critStatProc}</b> times with <b>${formatPercentage(critUptime)}</b> % uptime`}>
            {formatNumber(averageCrit)} average Crit
					</dfn>
          <br />
          <dfn data-tip={`Proced the Haste stat buff <b>${this.hasteStatProc}</b> times with <b>${formatPercentage(hasteUptime)}</b> % uptime`}>
            {formatNumber(averageHaste)} average Haste
					</dfn>
          <br />
          <dfn data-tip={`Proced the Mastery stat buff <b>${this.masteryStatProc}</b> times with <b>${formatPercentage(masteryUptime)}</b> % uptime`}>
            {formatNumber(averageMastery)} average Mastery
					</dfn>
        </div>
      ),
    };
  }
}

export default MementoOfAngerboda;
