import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Your basic attacks have a chance to trigger two rapid additional blows.
 */
class TalonStrike extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.traitsBySpellId[SPELLS.TALON_STRIKE_TRAIT.id];
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.TALON_STRIKE_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }
  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.TALON_STRIKE_TRAIT.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }
}

export default TalonStrike;
