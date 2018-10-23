import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

/**
 * Overpower causes a seismic wave that deals 124 Physical damage to enemies in a 10 yd line.
 */

class SeismicWave extends Analyzer {

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SEISMIC_WAVE.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.SEISMIC_WAVE_DAMAGES.id) {
      return;
    }
    this.damage += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    const damageThroughputPercent = this.owner.getPercentageOfTotalDamageDone(this.damage);
    const dps = this.damage / this.owner.fightDuration * 1000;
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.SEISMIC_WAVE.id}
        value={`${formatPercentage(damageThroughputPercent)} % / ${formatNumber(dps)} DPS`}
        tooltip={`Damage done: ${formatNumber(this.damage)}`
        }
      />
    );
  }
}

export default SeismicWave;
