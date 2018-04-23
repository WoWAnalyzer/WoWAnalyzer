import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import calculateEffectiveDamageStacked from 'Parser/Core/calculateEffectiveDamageStacked';
import ItemDamageDone from 'Main/ItemDamageDone';

const COAGULOPHATHY_INCREASE = 0.04;

/**
 * Coagulopathy
 * Increases the damage of Blood Plague by 4%
 */
class Coagulopathy extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  damage = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.COAGULOPHATHY_TRAIT.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_damage(event) {
    if(event.ability.guid !== SPELLS.BLOOD_PLAGUE.id){
      return;
    }
    this.damage += calculateEffectiveDamageStacked(event, COAGULOPHATHY_INCREASE, this.rank);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.COAGULOPHATHY_TRAIT.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }
}

export default Coagulopathy;
