import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatNumber, formatThousands, formatPercentage } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';

class DragonRoar extends Analyzer {

  targetsSlowed = 0;
  totalDamage = 0;
  rageGained = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DRAGON_ROAR_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DRAGON_ROAR_TALENT), this.onDragonRoarDamage);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.DRAGON_ROAR_TALENT), this.onDragonRoarEnergize);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.DRAGON_ROAR_TALENT), this.onDragonRoarSlow);
  }

  onDragonRoarDamage(event) {
    this.totalDamage += event.amount + (event.absorbed || 0);
  }

  onDragonRoarEnergize(event) {
    this.rageGained += event.resourceChange;
  }

  onDragonRoarSlow() {
    this.targetsSlowed += 1;
  }

  get percentageDamage() {    
    return this.owner.getPercentageOfTotalDamageDone(this.totalDamage);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.DRAGON_ROAR_TALENT.id}
        value={`${formatNumber(this.totalDamage / this.owner.fightDuration * 1000)} DPS`}
        label="Dragon Roar"
        tooltip={`Damage done: <b>${formatThousands(this.totalDamage)} (${formatPercentage(this.percentageDamage)}%)</b><br />
        Rage gained: <b>${formatThousands(this.rageGained)}</b><br />
        Enemies slowed: <b>${formatThousands(this.targetsSlowed)}</b>`}
      />
    );
  }
}

export default DragonRoar;
