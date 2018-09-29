import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

 /**
 * Your healing effects have a chance to grant the target X additional healing
 * every 2 sec for 12 sec. This effect doubles every 2 sec.
 */
class ConcentratedMending extends Analyzer {
  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.CONCENTRATED_MENDING.id);
  }

   on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CONCENTRATED_MENDING_HEALING.id) {
      return;
    }

    this.healing += event.amount + (event.absorbed || 0);
  }
   statistic() {
    const healingThroughputPercent = this.owner.getPercentageOfTotalHealingDone(this.healing);
    const hps = this.healing / this.owner.fightDuration * 1000;
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.CONCENTRATED_MENDING.id}
        value={`${formatPercentage(healingThroughputPercent)} % / ${formatNumber(hps)} HPS`}
        tooltip={`Healing done: ${formatNumber(this.healing)}`}
      />
    );
  }
}

 export default ConcentratedMending;
