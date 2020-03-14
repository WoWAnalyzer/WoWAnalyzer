import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import { formatNumber, formatPercentage } from 'common/format';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import React from 'react';

const azeriteTraitStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [damage,armor] = calculateAzeriteEffects(SPELLS.INFERNAL_ARMOR.id, rank, -1);
  obj.damage += damage;
  obj.armor += armor;
  return obj;
}, {
  damage: 0,
  armor: 0,
});

/**
 * Infernal Armor Azerite Power
 * Immolation Aura increases your Armor by 725, and causes melee attackers to take 513 Fire damage.
 *
 * example logs: 
 * 480 Azerite Piece with 2 traits
 * https://www.warcraftlogs.com/reports/pDNAdyrWRtVcGwB7#fight=23&type=summary&source=2
 * 
 * 435 Azerite Piece with one trait:
 * https://www.warcraftlogs.com/reports/dWtVhxLm2baGwfry#fight=12&type=damage-done&ability=273239
 * 
 * No traits:
 * https://www.warcraftlogs.com/reports/aLPjR3Nm49n8hXyD#fight=1&type=damage-done&source=1
 * 
 * 3 Traits 435,450,450
 * https://www.warcraftlogs.com/reports/W1HRnpJPB7FZkwht#fight=6&type=damage-done&source=14&ability=273239
 * 
 */
class InfernalArmor extends Analyzer {

  damage = 0;
  applyBuffTime = 0;
  buffActive = false;
  buffUptime = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.INFERNAL_ARMOR.id);
    if (!this.active) {
      return;
    }
  
    const { armor } = azeriteTraitStats(this.selectedCombatant.traitsBySpellId[SPELLS.INFERNAL_ARMOR.id]);
    this.infernalArmorArmor = armor;
    
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.INFERNAL_ARMOR_DAMAGE), this.onDamage);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INFERNAL_ARMOR_BUFF), this.onBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INFERNAL_ARMOR_BUFF), this.onRemoveBuff);
    this.addEventListener(Events.fightend, this.onFightEnd);

  }

  onDamage(event) {
    this.damage += event.amount;
  }

  onBuff(event) {
    this.buffActive = true;
    this.applyBuffTime = event.timestamp;
    
  }

  onRemoveBuff(event) {
    this.buffActive = false;
    this.buffUptime += event.timestamp - this.applyBuffTime;

  }

  onFightEnd(event) {
    if(this.buffActive) {
      this.buffUptime += event.timestamp - this.applyBuffTime;
    }
  }

  statistic() {
    const damageThroughputPercent = this.owner.getPercentageOfTotalDamageDone(this.damage);
    const dps = this.damage / this.owner.fightDuration * 1000;
    const buffUptimePercent = this.buffUptime / this.owner.fightDuration;

    return (
      <AzeritePowerStatistic
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.INFERNAL_ARMOR}>
          <img
            src="/img/sword.png"
            alt="Damage"
            className="icon"
          /> {formatNumber(dps)} DPS <small>{formatPercentage(damageThroughputPercent)} % of total</small>
          <br />
          <img
            src="/img/shield.png"
            alt="Armor"
            className="icon"
          /> {this.infernalArmorArmor} armor  <small>{formatPercentage(buffUptimePercent)} % uptime</small>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default InfernalArmor;
