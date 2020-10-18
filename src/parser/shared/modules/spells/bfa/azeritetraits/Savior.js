import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemHealingDone from 'interface/ItemHealingDone';
import { formatNumber } from 'common/format';
import Events from 'parser/core/Events';

/**
 Your heals on targets below 50% health have a chance to heal for an additional 2100.
 Example Log: /report/gqPpyXBG8mh7vHTN/41-Mythic+Mythrax+-+Kill+(9:15)/6-Spencer
 */
class Savior extends Analyzer {
  healing = 0;
  procs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SAVIOR.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SAVIOR_HEAL), this.onHeal);
  }

  onHeal(event) {
    this.healing += event.amount + (event.absorbed || 0);
    this.procs += 1;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.SAVIOR.id}
        value={<ItemHealingDone amount={this.healing} />}
        tooltip={`${formatNumber(this.healing)} total healing from ${this.procs} total procs.`}
      />
    );
  }
}

export default Savior;
