import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events from 'parser/core/Events';

const bloodRiteStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [haste] = calculateAzeriteEffects(SPELLS.BONDED_SOULS_TRAIT.id, rank);
  obj.haste += haste;
  return obj;
}, {
  haste: 0,
});

/**
 * Blood Rite
 * Gain x haste while active
 *
 * Example report: https://www.warcraftlogs.com/reports/k4bAJZKWVaGt12j9#fight=3&type=auras&source=14
 */
class BondedSouls extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  haste = 0;
  healing = 0;
  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BONDED_SOULS_BUFF_AND_HEAL.id) / this.owner.fightDuration;
  }
  get averageHaste() {
    return (this.haste * this.uptime).toFixed(0);
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BONDED_SOULS_TRAIT.id);
    if (!this.active) {
      return;
    }

    const { haste } = bloodRiteStats(this.selectedCombatant.traitsBySpellId[SPELLS.BONDED_SOULS_TRAIT.id]);
    this.haste = haste;

    this.statTracker.add(SPELLS.BONDED_SOULS_BUFF_AND_HEAL.id, {
      haste,
    });

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.BONDED_SOULS_BUFF_AND_HEAL), this._onHeal);
  }

  _onHeal(event) {
    this.healing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.BONDED_SOULS_TRAIT.id}
        value={(
          <>
            {this.owner.formatItemHealingDone(this.healing)}<br />
            and {this.averageHaste} average Haste gained
          </>
        )}
        tooltip={`<strong>${formatPercentage(this.uptime)}% uptime</strong>. Each proc grants <strong>${this.haste} Haste</strong> while active.`}
      />
    );
  }
}

export default BondedSouls;
