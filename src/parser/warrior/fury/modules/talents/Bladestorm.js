import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatNumber, formatThousands, formatPercentage } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

class Bladestorm extends Analyzer {

  totalDamage = 0;
  rageGained = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLADESTORM_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.BLADESTORM_DAMAGE, SPELLS.BLADESTORM_OH_DAMAGE]), this.onBladestormDamage);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.BLADESTORM_TALENT), this.onBladestormEnergize);
  }

  onBladestormDamage(event) {
    this.totalDamage += event.amount + (event.absorbed || 0);
  }

  onBladestormEnergize(event) {
    this.rageGained += event.resourceChange;
  }

  get percentageDamage() {    
    return this.owner.getPercentageOfTotalDamageDone(this.totalDamage);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.BLADESTORM_TALENT.id}
        value={`${formatNumber(this.totalDamage / this.owner.fightDuration * 1000)} DPS`}
        label="Bladestorm"
        tooltip={`<b>${formatThousands(this.totalDamage)} (${formatPercentage(this.percentageDamage)}%)</b> damage was done by Bladestorm, and <b>${formatThousands(this.rageGained)}</b> rage was generated.`}
      />
    );
  }
}

export default Bladestorm;
