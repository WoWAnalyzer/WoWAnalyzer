import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import Abilities from 'parser/core/modules/Abilities';
import ItemDamageDone from 'interface/ItemDamageDone';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

/**
 * Cyclotronic Blast
 * Use: Channel a cyclotronic blast, dealing x damage every 0.5 sec for 2.5 sec
 *
 * Has a wind-up channel for 1 second followed by 2.5 seconds of damaging channel
 *
 * Test Log: https://www.warcraftlogs.com/reports/YbzKf2g1qvXAHL9F/#fight=1&source=14
 */
class CyclotronicBlast extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    abilities: Abilities,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasRedPunchcard(ITEMS.CYCLOTRONIC_BLAST.id);
    if (this.active) {
      this.abilities.add({
        spell: SPELLS.CYCLOTRONIC_BLAST,
        name: ITEMS.CYCLOTRONIC_BLAST.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 120,
        castEfficiency: {
          suggestions: true,
        },
      });
    }
  }

  get damage() {
    return this.abilityTracker.getAbility(SPELLS.CYCLOTRONIC_BLAST.id).damageEffective;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.CYCLOTRONIC_BLAST}>
          <ItemDamageDone amount={this.damage} />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default CyclotronicBlast;
