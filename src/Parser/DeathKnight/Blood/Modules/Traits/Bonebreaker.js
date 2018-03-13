import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import getDamageBonusStacked from 'Parser/DeathKnight/Shared/getDamageBonusStacked';

const BONEBREAKER_INCREASE = 0.08;

/**
 * Bonebreaker
 * Increases the damage of Marrorend by 8%
 */
class Bonebreaker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  damage = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.BONEBREAKER_TRAIT.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_damage(event) {
    if(event.ability.guid !== SPELLS.MARROWREND.id){
      return;
    }
    this.damage += getDamageBonusStacked(event, BONEBREAKER_INCREASE, this.rank);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.BONEBREAKER_TRAIT.id}>
            <SpellIcon id={SPELLS.BONEBREAKER_TRAIT.id} noLink /> Bonebreaker
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} %
        </div>
      </div>
    );
  }
}

export default Bonebreaker;
