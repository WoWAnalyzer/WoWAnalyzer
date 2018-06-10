import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';
import Abilities from 'Parser/Core/Modules/Abilities';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Diima's Glacial Aegis
 * Use: grants x armor and deals AoE frost damage + slow
*/
class DiimasGlacialAegis extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
  };

  damage = 0;
  casts = 0;
  armorbuff = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.DIIMAS_GLACIAL_AEGIS.id);

    if (this.active) {
      this.armorbuff = calculateSecondaryStatDefault(930, 4045, this.combatants.selected.getItem(ITEMS.DIIMAS_GLACIAL_AEGIS.id).itemLevel);

      this.abilities.add({
        spell: SPELLS.CHILLING_NOVA,
        name: ITEMS.DIIMAS_GLACIAL_AEGIS.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.CHILLING_NOVA.id) {
      return;
    }

    this.damage += event.amount + event.absorbed;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.CHILLING_NOVA.id) {
      return;
    }

    this.casts += 1;
  }

  get uptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.FROZEN_ARMOR.id) / this.owner.fightDuration;
  }

  item() {
    return {
      item: ITEMS.DIIMAS_GLACIAL_AEGIS,
      result: (
        <React.Fragment>
          <dfn data-tip={`You cast "${SPELLS.CHILLING_NOVA.name}" ${this.casts} times for an uptime of ${formatPercentage(this.uptime)}%`}>
            {formatNumber(this.uptime * this.armorbuff)} Average Armor
          </dfn><br />
          <ItemDamageDone amount={this.damage} />
        </React.Fragment>
      ),
    };
  }
}

export default DiimasGlacialAegis;
