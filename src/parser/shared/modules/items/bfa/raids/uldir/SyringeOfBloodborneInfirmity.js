import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { calculateSecondaryStatDefault } from 'common/stats';
import { formatPercentage, formatNumber } from 'common/format';
import ItemDamageDone from 'interface/ItemDamageDone';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import CritIcon from 'interface/icons/CriticalStrike';
import Events from 'parser/core/Events';

/**
 * Syringe of Bloodborne Infirmity -
 * Equip: Your attacks have a chance to cause Wasting Infection, dealing 2424 Shadow damage over 12 sec.
 * Attacking an enemy suffering from Wasting Infection grants you 89 Critical Strike for 6 sec, stacking up to 5 times.
 *
 * Example log: /report/mx1NKYzjwQncGk4J/33-Mythic+Fetid+Devourer+-+Kill+(4:47)/6-Jaelaw/
 */

class SyringeOfBloodborneInfirmity extends Analyzer {

  damage = 0;
  hits = 0;
  statBuff = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.SYRINGE_OF_BLOODBORNE_INFIRMITY.id);
    if (this.active) {
      this.statBuff = calculateSecondaryStatDefault(355, 89, this.selectedCombatant.getItem(ITEMS.SYRINGE_OF_BLOODBORNE_INFIRMITY.id).itemLevel);
    }
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.WASTING_INFECTION), this.onApplyDebuff);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.WASTING_INFECTION), this.onDamage);
  }

  onApplyDebuff(event) {
    this.hits += 1;
  }

  onDamage(event) {
    this.damage += (event.amount || 0) + (event.absorbed || 0);
  }

  averageStatGain() {
    const averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.CRITICAL_PROWESS.id) / this.owner.fightDuration;
    return averageStacks * this.statBuff;
  }

  totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.CRITICAL_PROWESS.id) / this.owner.fightDuration;
  }

  buffTriggerCount() {
    return this.selectedCombatant.getBuffTriggerCount(SPELLS.CRITICAL_PROWESS.id);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
            Hit <strong>{this.hits}</strong> times, causing <strong>{formatNumber(this.damage)}</strong> damage. <br />
            Buff procced <strong>{this.buffTriggerCount()}</strong> times (<strong>{formatPercentage(this.totalBuffUptime())}%</strong> uptime).
          </>
        )}
      >
        <BoringItemValueText item={ITEMS.SYRINGE_OF_BLOODBORNE_INFIRMITY}>
          <ItemDamageDone amount={this.damage} /><br />
          <CritIcon /> {formatNumber(this.averageStatGain())} <small>average Critical Strike</small>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default SyringeOfBloodborneInfirmity;
