import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import HIT_TYPES from 'parser/core/HIT_TYPES';

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
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.GUTRIPPER_DAMAGE.id) {
      return;
    }
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
        tooltip={`Damage done: ${formatNumber(this.damage)}<br />
                  Gutripper procced a total of <b>${this.totalProcs}</b> times, <b>${critPercent}</b> of which were critital hits.`
        }
      />
    );
  }
}

export default Gutripper;
