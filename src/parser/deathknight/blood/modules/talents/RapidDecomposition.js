import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

class RapidDecomposition extends Analyzer {

  bpDamage = 0;
  dndDamage = 0;
  totalDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RAPID_DECOMPOSITION_TALENT.id);
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
      <TalentStatisticBox
        talent={SPELLS.RAPID_DECOMPOSITION_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(2)}
        value={`${this.owner.formatItemDamageDone(this.totalDamage)}`}
        tooltip={`<strong>Blood Plague:</strong> ${this.owner.formatItemDamageDone(this.bpDamage)}</br>
                  <strong>Death And Decay:</strong> ${this.owner.formatItemDamageDone(this.dndDamage)}`}
      />
    );
  }
}

export default RapidDecomposition;
