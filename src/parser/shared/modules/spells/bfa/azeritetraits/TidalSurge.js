import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import HIT_TYPES from 'game/HIT_TYPES';

/**
 * Your damaging spells and abilities have a chance to release a tidal surge,
 * dealing 1623 Frost damage to your target and slowing their movement speed by 20% for 6 sec.
 *
 * https://www.warcraftlogs.com/reports/1PzGDqayN6ATQJXZ#fight=last&type=damage-done&source=13
 */
class TidalSurge extends Analyzer {
  damage = 0;
  totalProcs = 0;
  crits = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.TIDAL_SURGE.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.TIDAL_SURGE.id) {
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
        trait={SPELLS.TIDAL_SURGE.id}
        value={`${formatPercentage(damageThroughputPercent)} % / ${formatNumber(dps)} DPS`}
        tooltip={`Damage done: ${formatNumber(this.damage)}<br />
                  Tidal Surge procced a total of <b>${this.totalProcs}</b> times, <b>${critPercent}</b> of which were critital hits.`
        }
      />
    );
  }
}

export default TidalSurge;
