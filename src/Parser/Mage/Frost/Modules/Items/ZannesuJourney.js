import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Main/ItemDamageDone';

const DAMAGE_BONUS = .35;

/**
 * Zann'esu Journey:
 * Flurry increases the damage of your next Blizzard by 35%, stacking up to 5 times.
 */
class ZannesuJourney extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;
  stackCount = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.ZANNESU_JOURNEY.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLIZZARD.id) {
      return;
    }
    const buff = this.combatants.selected.getBuff(SPELLS.ZANNESU_JOURNEY_BUFF.id);
    this.stackCount = (buff && buff.stacks) || 0;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLIZZARD_DAMAGE.id) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, DAMAGE_BONUS * this.stackCount);
  }

  item() {
    return {
      item: ITEMS.ZANNESU_JOURNEY,
      result: <ItemDamageDone amount={this.damage} />,
    };
  }
}

export default ZannesuJourney;
