import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { calculateSecondaryStatDefault } from 'common/stats';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Abilities from 'Parser/Core/Modules/Abilities';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Tome of Unraveling Sanity
 * Use: Deal 313390 Shadow damage over 12 sec. When this effect ends or the target dies, you gain 2756 Critical Strike for 12 sec plus any time remaining on the effect. (1 Min Cooldown)
 */
class TomeOfUnravelingSanity extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
  };

  damage = 0;
  procAmount = null;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.TOME_OF_UNRAVELING_SANITY.id);

    if (this.active) {
      this.procAmount = calculateSecondaryStatDefault(910, 2756, this.combatants.selected.getItem(ITEMS.TOME_OF_UNRAVELING_SANITY.id).itemLevel);
      this.abilities.add({
        spell: SPELLS.TOME_OF_UNRAVELING_SANITY_DAMAGE,
        name: ITEMS.TOME_OF_UNRAVELING_SANITY.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.TOME_OF_UNRAVELING_SANITY_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  get averageCritGain() {
    const uptimePercent = this.combatants.selected.getBuffUptime(SPELLS.TOME_OF_UNRAVELING_SANITY_BUFF.id) / this.owner.fightDuration;
    return this.procAmount * uptimePercent;
  }

  item() {
    return {
      item: ITEMS.TOME_OF_UNRAVELING_SANITY,
      result: (
        <dfn data-tip="Listed damage value counts only the DoT, and the listed average crit value is the stat gain from procs averaged over the fight's duration.">
          <ItemDamageDone amount={this.damage} /><br />
          {this.averageCritGain.toFixed(0)} average crit
        </dfn>
      ),
    };
  }
}

export default TomeOfUnravelingSanity;
