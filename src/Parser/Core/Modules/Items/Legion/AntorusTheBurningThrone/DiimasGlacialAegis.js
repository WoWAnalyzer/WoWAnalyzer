import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Wrapper from 'common/Wrapper';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatPercentage } from 'common/format';
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

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.DIIMAS_GLACIAL_AEGIS.id);

    if (this.active) {
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
        <Wrapper>
          <dfn data-tip={`You casted "${SPELLS.CHILLING_NOVA.name}" ${this.casts} times`}>
            {formatPercentage(this.uptime)}% uptime on <SpellLink id={SPELLS.FROZEN_ARMOR.id} />
          </dfn><br/>
          <ItemDamageDone amount={this.damage} />
        </Wrapper>
      ),
    };
  }
}

export default DiimasGlacialAegis;
