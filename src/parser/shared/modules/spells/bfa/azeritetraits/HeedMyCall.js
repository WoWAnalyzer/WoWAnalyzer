import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import Events from 'parser/core/Events';

/**
 * Your damaging abilities have a chance to deal X1 Nature damage to your target,
 * and X2 Nature damage to enemies within 3 yards of that target.
 */
class HeedMyCall extends Analyzer {

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.HEED_MY_CALL.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.HEED_MY_CALL_PRIMARY_DAMAGE, SPELLS.HEED_MY_CALL_AOE_DAMAGE]), this.onDamage);
  }

  onDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const damageThroughputPercent = this.owner.getPercentageOfTotalDamageDone(this.damage);
    const dps = this.damage / this.owner.fightDuration * 1000;
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.HEED_MY_CALL.id}
        value={`${formatPercentage(damageThroughputPercent)} % / ${formatNumber(dps)} DPS`}
        tooltip={`Damage done: ${formatNumber(this.damage)}`}
      />
    );
  }
}

export default HeedMyCall;
