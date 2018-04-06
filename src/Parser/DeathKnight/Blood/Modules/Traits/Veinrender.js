import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import calculateEffectiveDamageStacked from 'Parser/Core/calculateEffectiveDamageStacked';

const VEINRENDER_INCREASE = 0.03;

/**
 * Veinrender
 * Increases the damage of Heart Strike by 3%
 */
class Veinrender extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  damage = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.VEINRENDER_TRAIT.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_damage(event) {
    if(event.ability.guid !== SPELLS.HEART_STRIKE.id){
      return;
    }
    this.damage += calculateEffectiveDamageStacked(event, VEINRENDER_INCREASE, this.rank);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.VEINRENDER_TRAIT.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} %
        </div>
      </div>
    );
  }
}

export default Veinrender;
