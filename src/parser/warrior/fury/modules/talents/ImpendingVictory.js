import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatNumber, formatThousands, formatPercentage } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

class ImpendingVicory extends Analyzer {
  totalDamage = 0;
  totalHeal = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.IMPENDING_VICTORY_TALENT.id);

    if (!this.active) {
      return;
    }
    
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.IMPENDING_VICTORY_TALENT_HEAL), this.onImpendingVictoryHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.IMPENDING_VICTORY_TALENT), this.onImpendingVictoryDamage);
  }

  onImpendingVictoryDamage(event) {
    this.totalDamage += event.amount + (event.absorbed || 0);
  }

  onImpendingVictoryHeal(event) {
    this.totalHeal += event.amount;
  }

  get percentageDamage() {    
    return this.owner.getPercentageOfTotalDamageDone(this.totalDamage);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.IMPENDING_VICTORY_TALENT.id}
        value={`${formatNumber(this.totalHeal)} Healing`}
        label="Impending Victory"
        tooltip={`<b>${formatThousands(this.totalDamage)} (${formatPercentage(this.percentageDamage)}%)</b> damage was done by Impending Victory.`}
      />
    );
  }
}

export default ImpendingVicory;
