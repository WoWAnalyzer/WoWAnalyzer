import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemHealingDone from 'interface/others/ItemHealingDone';

 /**
  * Serene Spirit:
  * When you cast Astral Shift and when Astral Shift ends, heal for 3717.
  */
class SereneSpirit extends Analyzer {
  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SERENE_SPIRIT_TRAIT.id);
  }

   on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SERENE_SPIRIT_HEAL.id) {
      return;
    }
    this.healing += event.amount + (event.absorbed || 0);
  }

   statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.SERENE_SPIRIT_TRAIT.id}
        value={<ItemHealingDone amount={this.healing} />}
        tooltip={`Healing done: ${formatNumber(this.healing)}`}
      />
    );
  }
}

 export default SereneSpirit;
