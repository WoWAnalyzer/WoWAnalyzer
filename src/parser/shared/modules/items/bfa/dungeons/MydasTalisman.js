import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import Abilities from 'parser/core/modules/Abilities';

import ItemDamageDone from 'interface/ItemDamageDone';
import Events from 'parser/core/Events';

/**
 * My'das Talisman
 * Use: Turn your hands to gold, causing your next 5 auto-attacks to deal X extra damage. (1 Min, 30 Sec Cooldown)
 *
 * Test Log: https://www.warcraftlogs.com/reports/c3JjQfWgV4XptKkP#fight=3&type=damage-done&source=8
 */
class MydasTalisman extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.MYDAS_TALISMAN.id);

    if (this.active) {
      this.damage = 0;

      this.abilities.add({
        spell: SPELLS.TOUCH_OF_GOLD,
        buffSpellId: SPELLS.TOUCH_OF_GOLD.id,
        name: ITEMS.MYDAS_TALISMAN.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.TOUCH_OF_GOLD_DAMAGE), this.onDamage);
  }

  onDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.MYDAS_TALISMAN}>
          <ItemDamageDone amount={this.damage} />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default MydasTalisman;
