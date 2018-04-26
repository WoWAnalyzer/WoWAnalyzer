import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

import Combatants from 'Parser/Core/Modules/Combatants';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Main/ItemDamageDone';
import ITEMS from 'common/ITEMS/HUNTER';

/**
 * Targets hit by your Raptor Strike and Carve are also affected by Serpent Sting, dealing (864% of Attack power) Nature damage over 15 sec.
 */
class SerpentSting extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  bonusDamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SERPENT_STING_TALENT.id) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HUNTMASTER.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SERPENT_STING_DEBUFF.id) {
      return;
    }
    this.bonusDamage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.SERPENT_STING_DEBUFF.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.bonusDamage} />
        </div>
      </div>
    );
  }
}

export default SerpentSting;
