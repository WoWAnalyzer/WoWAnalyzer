import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import HIT_TYPES from 'game/HIT_TYPES';
import Events from 'parser/core/Events';

/**
 * Your damaging abilities have a chance to deal X Physical damage to the target.
 * Gutripper occurs much more often against targets below 30% health.
 */
class Gutripper extends Analyzer {
  damage = 0;
  totalProcs = 0;
  crits = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.GUTRIPPER.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.GUTRIPPER_DAMAGE), this.onDamage);
  }

  onDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
    this.totalProcs += 1;
    this.crits += event.hitType === HIT_TYPES.CRIT ? 1 : 0;
  }

  statistic() {
    const damageThroughputPercent = this.owner.getPercentageOfTotalDamageDone(this.damage);
    const dps = this.damage / this.owner.fightDuration * 1000;
    const critPercent = (this.crits === 0 || this.totalProcs === 0) ? 'none' : `${formatPercentage((this.crits / this.totalProcs), 0)}%`;
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.GUTRIPPER.id}
        value={`${formatPercentage(damageThroughputPercent)} % / ${formatNumber(dps)} DPS`}
        tooltip={(
          <>
            Damage done: {formatNumber(this.damage)}<br />
            Gutripper procced a total of <strong>{this.totalProcs}</strong> times, <strong>{critPercent}</strong> of which were critital hits.
          </>
        )}
      />
    );
  }
}

export default Gutripper;
