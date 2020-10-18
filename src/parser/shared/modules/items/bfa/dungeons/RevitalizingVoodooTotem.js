import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import Abilities from 'parser/core/modules/Abilities';

import ItemHealingDone from 'interface/ItemHealingDone';
import Events from 'parser/core/Events';

/**
 * Revitalizing Voodoo Totem -
 * Use: Heals the target for 0 every 0.5 sec, stacking up to 12 times. Healing starts low and increases over the duration. (1 Min, 30 Sec Cooldown)
 *
 * Test Log: https://www.warcraftlogs.com/reports/2fZTqh6VbNC1xXPL#fight=6&type=damage-done&source=17
 */
class RevitalizingVoodooTotem extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };


  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.REVITALIZING_VOODOO_TOTEM.id);

    if (this.active) {
      this.abilities.add({
        spell: SPELLS.TOUCH_OF_THE_VOODOO,
        buffSpellId: SPELLS.TOUCH_OF_THE_VOODOO.id,
        name: ITEMS.REVITALIZING_VOODOO_TOTEM.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.TOUCH_OF_THE_VOODOO), this.onHeal);
  }

  onHeal(event) {
    this.healing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.REVITALIZING_VOODOO_TOTEM}>
          <ItemHealingDone amount={this.healing} />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default RevitalizingVoodooTotem;
