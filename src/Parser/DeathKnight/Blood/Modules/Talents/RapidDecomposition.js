import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class RapidDecomposition extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  bpDamage = 0;
  dndDamage = 0;
  totalDamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.RAPID_DECOMPOSITION_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLOOD_PLAGUE.id && spellId !== SPELLS.DEATH_AND_DECAY_DAMAGE_TICK.id) {
      return;
    }
    if (spellId === SPELLS.BLOOD_PLAGUE.id) {
      this.bpDamage += calculateEffectiveDamage(event, 0.15);
    }else {
      this.dndDamage += calculateEffectiveDamage(event, 0.15);
    }
    this.totalDamage = this.bpDamage + this.dndDamage;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RAPID_DECOMPOSITION_TALENT.id} />}
        value={`${this.owner.formatItemDamageDone(this.totalDamage)}`}
        label='Rapid Decomposition'
        tooltip={`<strong>Blood Plague:</strong> ${this.owner.formatItemDamageDone(this.bpDamage)}</br>
                  <strong>Death And Decay:</strong> ${this.owner.formatItemDamageDone(this.dndDamage)}`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);

}

export default RapidDecomposition;
