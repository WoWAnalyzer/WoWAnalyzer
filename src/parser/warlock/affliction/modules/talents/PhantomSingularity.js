import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import Statistic from 'interface/statistics/Statistic';

class PhantomSingularity extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PHANTOM_SINGULARITY_TALENT.id);
  }

  statistic() {
    const spell = this.abilityTracker.getAbility(SPELLS.PHANTOM_SINGULARITY_TALENT.id);
    const damage = spell.damageEffective + spell.damageAbsorbed;
    const dps = damage / this.owner.fightDuration * 1000;
    return (
      <Statistic
        size="small"
        tooltip={`${formatThousands(damage)} damage`}
      >
        <div className="pad">
          <label><SpellIcon id={SPELLS.PHANTOM_SINGULARITY_TALENT.id} /> Phantom Singularity damage</label>
          <div className="value">
            {formatNumber(dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))} % of total</small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default PhantomSingularity;
