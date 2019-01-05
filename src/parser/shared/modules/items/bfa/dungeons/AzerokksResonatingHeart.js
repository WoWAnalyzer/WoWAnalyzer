import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';
import { calculatePrimaryStat } from 'common/stats';
import Tooltip from 'common/Tooltip';

import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';

const BASE_ITEM_LEVEL = 300;
const BASE_AGILITY_BUFF = 593;

/**
 * Azerokk's Resonating Heart
 * Equip: Your attacks have a chance to harmonize with the shard, granting you X Agility for 15 sec.
 */
class AzerokksResonatingHeart extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.AZEROKKS_RESONATING_HEART.id);

    if(!this.active) {
      return;
    }

    this.procs = 0;

    const itemLevel = this.selectedCombatant.getItem(ITEMS.AZEROKKS_RESONATING_HEART.id).itemLevel;
    this.agilityBuff = calculatePrimaryStat(BASE_ITEM_LEVEL, BASE_AGILITY_BUFF, itemLevel);
  }

  on_byPlayer_applybuff(event) {
    this.handleBuff(event);
  }

  on_byPlayer_refreshbuff(event) {
    this.handleBuff(event);
  }

  handleBuff(event) {
    if(event.ability.guid !== SPELLS.BENEFICIAL_VIBRATIONS.id) {
      return;
    }

    this.procs++;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BENEFICIAL_VIBRATIONS.id) / this.owner.fightDuration;
  }

  get averageAgility() {
    return (this.agilityBuff * this.uptime).toFixed(0);
  }

  item() {
    return {
      item: ITEMS.AZEROKKS_RESONATING_HEART,
      result: (
        <Tooltip content={<>You procced <strong>{SPELLS.BENEFICIAL_VIBRATIONS.name}</strong> {this.procs} times with an uptime of {formatPercentage(this.uptime)}%.</>}>
          {this.averageAgility} average Agility
        </Tooltip>
      ),
    };
  }
}

export default AzerokksResonatingHeart;
