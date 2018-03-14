import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import getDamageBonusStacked from 'Parser/DeathKnight/Shared/getDamageBonusStacked';

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
    this.damage += getDamageBonusStacked(event, COAGULOPHATHY_INCREASE, this.rank);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.COAGULOPHATHY_TRAIT.id}>
            <SpellIcon id={SPELLS.COAGULOPHATHY_TRAIT.id} noLink /> Coagulopathy
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} %
        </div>
      </div>
    );
  }
}

export default Coagulopathy;