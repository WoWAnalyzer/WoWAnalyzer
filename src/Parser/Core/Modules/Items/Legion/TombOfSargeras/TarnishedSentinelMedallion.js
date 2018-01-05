import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';
import Abilities from 'Parser/Core/Modules/Abilities';

/**
 * Tarnished Sentinel Medallion
 * Use: Call upon a spectral owl to attack your target, inflicting 61201 Arcane damage every 1 sec for 20 sec. Your ranged attacks and spells against the same enemy have a chance to make the owl perform an additional attack for 75602 damage. (2 Min Cooldown)
 */
class TarnishedSentinelMedallion extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
  };

  damage = 0;
  damageIds = [
    SPELLS.SPECTRAL_BOLT.id,
    SPELLS.SPECTRAL_BLAST.id,
  ];

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.TARNISHED_SENTINEL_MEDALLION.id);

    if (this.active) {
      this.abilities.add({
        spell: SPELLS.SPECTRAL_OWL,
        name: ITEMS.TARNISHED_SENTINEL_MEDALLION.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!this.damageIds.includes(spellId)) {
      return;
    }

    this.damage += event.amount + (event.absorbed || 0);
  }

  item() {
    return {
      item: ITEMS.TARNISHED_SENTINEL_MEDALLION,
      result: <ItemDamageDone amount={this.damage} />,
    };
  }
}

export default TarnishedSentinelMedallion;
