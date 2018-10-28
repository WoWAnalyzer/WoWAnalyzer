import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemHealingDone from 'interface/others/ItemHealingDone';

/**
 Your heals have a chance to apply Bracing Chill. Healing a target with Bracing Chill will heal for an additional 1155 and move Bracing Chill to a nearby ally (up to 6 times).

 Example Log: /report/CcmkyRv68WZghAqD/2-Mythic+Taloc+-+Kill+(4:57)/10-Aëthïl
 */
class BracingChill extends Analyzer {
  healing = 0;
  procs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BRACING_CHILL.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BRACING_CHILL_HEAL.id) {
      return;
    }

    this.healing += event.amount + (event.absorbed || 0);
    this.procs += 1;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.BRACING_CHILL.id}
        value={<ItemHealingDone amount={this.healing} />}
        tooltip={`
          Healing done: ${formatNumber(this.healing)}<br />
          Total heals: ${this.procs}
        `}
      />
    );
  }
}

export default BracingChill;
