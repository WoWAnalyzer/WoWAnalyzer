import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

/**
 * While Aspect of the Wild is active, Hati and your primary pet also trigger a Thunderslash with each auto attack, dealing ((50% of Attack
 * power) * (1 * 0.96 * 1.06)) Nature damage.
 */
class Thunderslash extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.traitsBySpellId[SPELLS.THUNDERSLASH_TRAIT.id];
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.THUNDERSLASH_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.THUNDERSLASH_TRAIT.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }
}

export default Thunderslash;
