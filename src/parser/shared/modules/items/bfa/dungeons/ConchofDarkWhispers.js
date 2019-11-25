import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import UptimeIcon from 'interface/icons/Uptime';
import CriticalStrikeIcon from 'interface/icons/CriticalStrike';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import Analyzer from 'parser/core/Analyzer';
import { formatPercentage, formatNumber } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';

/**
 * Conch of Dark Whispers -
 * Equip: Your spells have a chance to grant you 455 Critical Strike for 15 sec. (Approximately 1 procs per minute)
 * 
 * Test Log: https://www.warcraftlogs.com/reports/aPkxWyCg9Q4q81Xw#fight=4&type=damage-done
 */
class ConchofDarkWhispers extends Analyzer {
  statBuff = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.CONCH_OF_DARK_WHISPERS.id);

    if(this.active) {
      this.statBuff = calculateSecondaryStatDefault(300, 455, this.selectedCombatant.getItem(ITEMS.CONCH_OF_DARK_WHISPERS.id).itemLevel);
    }
  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.CONCH_OF_DARK_WHISPERS_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.CONCH_OF_DARK_WHISPERS}>
          <UptimeIcon /> {formatPercentage(this.totalBuffUptime)}% <small>uptime</small><br />
          <CriticalStrikeIcon /> {formatNumber(this.totalBuffUptime * this.statBuff)} <small>average Critical Strike gained</small>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default ConchofDarkWhispers;
