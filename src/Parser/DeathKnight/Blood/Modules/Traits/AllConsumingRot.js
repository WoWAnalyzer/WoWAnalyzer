import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import calculateEffectiveDamageStacked from 'Parser/Core/calculateEffectiveDamageStacked';
import ItemDamageDone from 'Main/ItemDamageDone';

const ALL_CONSUMING_ROT_INCREASE = 0.04;

/**
 * All Consuming Rot
 * Increases the damage of Death and Decay by 4%
 */
class AllConsumingRot extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  damage = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.ALL_CONSUMING_ROT_TRAIT.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_damage(event) {
    if(event.ability.guid !== SPELLS.DEATH_AND_DECAY_DAMAGE_TICK.id){
      return;
    }

    this.damage += calculateEffectiveDamageStacked(event, ALL_CONSUMING_ROT_INCREASE, this.rank);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.ALL_CONSUMING_ROT_TRAIT.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }
}

export default AllConsumingRot;
