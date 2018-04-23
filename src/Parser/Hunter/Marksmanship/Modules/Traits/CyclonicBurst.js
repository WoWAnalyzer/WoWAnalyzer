import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from "common/SpellLink";
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * The trail of wind left by Windburst deals (300% of Attack power) damage every 1 sec to enemies within, and reduces their movement speed by 50%.
 */
class CyclonicBurst extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.CYCLONIC_BURST_TRAIT.id];
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CYCLONIC_BURST_IMPACT_TRAIT.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }
  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.CYCLONIC_BURST_TRAIT.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }

}

export default CyclonicBurst;
