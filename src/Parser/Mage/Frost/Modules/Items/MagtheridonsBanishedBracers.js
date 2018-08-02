import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

const DAMAGE_BONUS = .03;

/**
 * Magtheridon's Banished Bracers:
 * Your Ice Lance increases the damage of your Ice Lances by 3% for 8 seconds, stacking up to 6 times.
 */
class MagtheridonsBanishedBracers extends Analyzer {
  damage = 0;
  stackCount = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasWrists(ITEMS.MAGTHERIDONS_BANISHED_BRACERS.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ICE_LANCE_DAMAGE.id) {
      return;
    }
    const buff = this.selectedCombatant.getBuff(SPELLS.MAGTHERIDONS_MIGHT_BUFF.id);
    if (buff) {
      this.damage += calculateEffectiveDamage(event, DAMAGE_BONUS * buff.stacks);
    }
  }

  item() {
    return {
      item: ITEMS.MAGTHERIDONS_BANISHED_BRACERS,
      result: <ItemDamageDone amount={this.damage} />,
    };
  }
}

export default MagtheridonsBanishedBracers;
