import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

//Test Log: /report/ABH7D8W1Qaqv96mt/2-Mythic+Taloc+-+Kill+(4:12)/Ghaz/statistics

class ColdSteelHotBlood extends Analyzer {
  totalDamage = 0;
  totalHealing = 0;
  totalOverhealing = 0;
  rageGained = 0;

  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTrait(SPELLS.COLD_STEEL_HOT_BLOOD.id);

    if(!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.COLD_STEEL_HOT_BLOOD_DAMAGE), this.onTraitDamage);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.COLD_STEEL_HOT_BLOOD_ENERGIZE), this.onEnergize);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.COLD_STEEL_HOT_BLOOD_DAMAGE), this.onTraitHealing);
  }

  onEnergize(event) {
    this.rageGained += event.resourceChange;
  }

  onTraitDamage(event) {
    this.totalDamage += event.amount + (event.absorbed || 0);
  }

  onTraitHealing(event) {
    this.totalHealing += event.amount;
    this.totalOverhealing += (event.overheal || 0);
  }

  get damagePercentage() {
    return this.owner.getPercentageOfTotalDamageDone(this.totalDamage);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={<>Cold Steel, Hot Blood did <b>{formatThousands(this.totalDamage)} ({formatPercentage(this.damagePercentage)}%)</b> damage and <b>{formatThousands(this.totalHealing)}</b> healing (<b>{formatThousands(this.totalOverhealing)}</b> overhealing).</>}
      >
        <BoringSpellValueText spell={SPELLS.COLD_STEEL_HOT_BLOOD}>
          {formatNumber(this.rageGained)} <small>rage generated</small>
        </BoringSpellValueText>
      </ItemStatistic>
    );
  }
}

export default ColdSteelHotBlood;
