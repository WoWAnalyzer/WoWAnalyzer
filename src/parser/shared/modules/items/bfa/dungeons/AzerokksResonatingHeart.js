import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';
import { calculatePrimaryStat } from 'common/stats';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import AgilityIcon from 'interface/icons/Agility';

import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';

const BASE_ITEM_LEVEL = 300;
const BASE_AGILITY_BUFF = 593;

/**
 * Azerokk's Resonating Heart
 * Equip: Your attacks have a chance to harmonize with the shard, granting you X Agility for 15 sec.
 *
 * Test log: http://wowanalyzer.com/report/PcaGB6n41NDMrbmA/1-Mythic+Champion+of+the+Light+-+Kill+(1:37)/Baboune/statistics
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

    this.procs += 1;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BENEFICIAL_VIBRATIONS.id) / this.owner.fightDuration;
  }

  get averageAgility() {
    return (this.agilityBuff * this.uptime).toFixed(0);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={<>You procced <strong>{SPELLS.BENEFICIAL_VIBRATIONS.name}</strong> {this.procs} times with an uptime of {formatPercentage(this.uptime)}%.</>}
      >
        <BoringItemValueText item={ITEMS.AZEROKKS_RESONATING_HEART}>
          <AgilityIcon /> {this.averageAgility} <small>average Agility gained</small>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default AzerokksResonatingHeart;
