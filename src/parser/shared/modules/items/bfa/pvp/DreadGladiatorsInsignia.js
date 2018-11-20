import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import { formatPercentage } from 'common/format';
import { calculatePrimaryStat } from 'common/stats';

import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';

const BASE_ITEM_LEVEL = 335;
const BASE_PRIMARY_STAT_BUFF = 462;

/**
 * Dread Gladiator's Insignia
 * Equip: Your damaging spells and abilities have a chance to grant X primary stat for 20 sec.
 */
class DreadGladiatorsInsignia extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.DREAD_GLADIATORS_INSIGNIA.id);

    if(!this.active) {
      return;
    }

    this.procs = 0;

    const itemLevel = this.selectedCombatant.getItem(ITEMS.DREAD_GLADIATORS_INSIGNIA.id).itemLevel;
    this.primaryStatBuff = calculatePrimaryStat(BASE_ITEM_LEVEL, BASE_PRIMARY_STAT_BUFF, itemLevel);
  }

  on_byPlayer_applybuff(event) {
    this.handleBuff(event);
  }

  on_byPlayer_refreshbuff(event) {
    this.handleBuff(event);
  }

  handleBuff(event) {
    if(event.ability.guid !== SPELLS.TASTE_OF_VICTORY.id) {
      return;
    }

    this.procs++;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.TASTE_OF_VICTORY.id) / this.owner.fightDuration;
  }

  get averagePrimaryStat() {
    return (this.primaryStatBuff * this.uptime).toFixed(0);
  }

  item() {
    return {
      item: ITEMS.DREAD_GLADIATORS_INSIGNIA,
      result: (
        <>
          <dfn data-tip={`You procced <b>${SPELLS.TASTE_OF_VICTORY.name}</b> ${this.procs} times with an uptime of ${formatPercentage(this.uptime)}%.`}>
          {this.averagePrimaryStat} average Primary Stat
          </dfn>
        </>
      ),
    };
  }
}

export default DreadGladiatorsInsignia;
