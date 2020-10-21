import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events from 'parser/core/Events';

const swirlingSandsStats = traits => Object.values(traits).reduce((total, rank) => {
  const [crit] = calculateAzeriteEffects(SPELLS.SWIRLING_SANDS.id, rank);
  return total + crit;
}, 0);

/**
 * Swirling Sands
 * Your spells and abilities have a chance to conjure Swirling Sands, increasing your Critical Strike by 576 for 12 sec.
 * Your critical effects extend Swirling Sands by 1 sec, up to a maximum duration of 18 sec.
 */
class SwirlingSands extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  crit = 0;
  swirlingSandsProcs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SWIRLING_SANDS.id);
    if (!this.active) {
      return;
    }

    this.crit = swirlingSandsStats(this.selectedCombatant.traitsBySpellId[SPELLS.SWIRLING_SANDS.id]);

    this.statTracker.add(SPELLS.SWIRLING_SANDS_BUFF.id, {
      crit: this.crit,
    });
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SWIRLING_SANDS_BUFF), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SWIRLING_SANDS_BUFF), this.onRefreshBuff);
  }

  onApplyBuff(event) {
    this.swirlingSandsProcs += 1;
  }

  onRefreshBuff(event) {
    this.swirlingSandsProcs += 1;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SWIRLING_SANDS_BUFF.id) / this.owner.fightDuration;
  }

  get averageCrit() {
    return (this.crit * this.uptime).toFixed(0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.SWIRLING_SANDS.id}
        value={`${this.averageCrit} average crit`}
        tooltip={(
          <>
            {SPELLS.SWIRLING_SANDS.name} grants <strong>{this.crit} crit</strong> while active.<br />
            You procced <strong>{SPELLS.SWIRLING_SANDS.name} {this.swirlingSandsProcs} times</strong> with an uptime of {formatPercentage(this.uptime)}%.
          </>
        )}
      />
    );
  }
}

export default SwirlingSands;
