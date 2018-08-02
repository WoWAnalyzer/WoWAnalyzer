import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

const DAMAGE_BONUS = .35;

/**
 * Zann'esu Journey:
 * Flurry increases the damage of your next Blizzard by 35%, stacking up to 5 times.
 */
class ZannesuJourney extends Analyzer {
  damage = 0;
  stackCount = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasWaist(ITEMS.ZANNESU_JOURNEY.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLIZZARD.id) {
      return;
    }
    const buff = this.selectedCombatant.getBuff(SPELLS.ZANNESU_JOURNEY_BUFF.id);
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
