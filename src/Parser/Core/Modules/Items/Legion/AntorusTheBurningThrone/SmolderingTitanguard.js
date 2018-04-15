import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Wrapper from 'common/Wrapper';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber, formatPercentage } from 'common/format';
import Abilities from 'Parser/Core/Modules/Abilities';
import ItemDamageDone from 'Main/ItemDamageDone';
import ItemHealingDone from 'Main/ItemHealingDone';

/**
 * Smoldering Titanguard
 * Use: absorb x damage over 3sec and deal fire damage when it expires
 */
class SmolderingTitanguard extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
  };

  damage = 0;
  healing = 0;
  overhealing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.SMOLDERING_TITANGUARD.id);

    if (this.active) {
      this.abilities.add({
        spell: SPELLS.BULLWARK_OF_FLAME,
        name: ITEMS.SMOLDERING_TITANGUARD.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.WAVE_OF_FLAME.id) {
      return;
    }

    this.damage += event.amount + event.absorbed;
  }

  on_byPlayer_absorbed(event) {
    if (event.ability.guid !== SPELLS.BULLWARK_OF_FLAME.id) {
      return;
    }

    this.healing += event.amount;
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.BULLWARK_OF_FLAME.id) {
      return;
    }

    this.overhealing += event.absorb;
  }

  item() {
    return {
      item: ITEMS.SMOLDERING_TITANGUARD,
      result: (
        <Wrapper>
          <ItemDamageDone amount={this.damage} /><br/>
          <dfn data-tip={`You wasted ${formatPercentage(this.overhealing / (this.overhealing + this.healing))}% (${formatNumber(this.overhealing)}) of the total possible absorb.`}>
            <ItemHealingDone amount={this.healing} />
          </dfn>
        </Wrapper>
      ),
    };
  }
}

export default SmolderingTitanguard;
