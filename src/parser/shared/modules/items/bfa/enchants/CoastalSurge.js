import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import ItemHealingDone from 'interface/ItemHealingDone';

const COASTAL_SURGE_ENCHANT_ID = 5946;
/**
 * Costal Surge:
 * Permanently enchant a weapon to sometimes cause the wielder's helpful spells to put a short heal over time effect on the target for 10 sec.
 *
 * Test Log: /report/2fZTqh6VbNC1xXPL/6-Normal+Champion+of+the+Light+-+Kill+(1:31)/Akkame/statistics
 */
class CostalSurge extends Analyzer {
  healing = 0;

  constructor(...args) {
    super(...args);
    const item = this.selectedCombatant._getGearItemBySlotId(15);
    this.active = item && item.permanentEnchant === COASTAL_SURGE_ENCHANT_ID;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.COASTAL_SURGE.id) {
      return;
    }

    this.healing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.COASTAL_SURGE}>
          <ItemHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </ItemStatistic>
    );
  }

}
export default CostalSurge;
