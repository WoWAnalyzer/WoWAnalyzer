import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

class Tier21_4p extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  totalDeathCoilCasts = 0;
  totalDeathCoilDamageEvents = 0;
  isNextNormal = 0;
  freeCastDamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.UNHOLY_DEATH_KNIGHT_T21_4SET_BONUS.id);
  }

  on_byPlayer_cast(event){
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.DEATH_COIL.id){
      return;
    }
    this.totalDeathCoilCasts++; 
    this.isNextNormal = 1;   
  }

  on_byPlayer_damage(event){
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.DEATH_COIL_DAMAGE.id){
      return;
    }
    this.totalDeathCoilDamageEvents++; 
    this.isNextNormal ? this.isNextNormal = 0 : this.freeCastDamage += event.amount + (event.absorbed || 0)
  }

  item() {
    const freeDeathcoils = (this.totalDeathCoilDamageEvents - this.totalDeathCoilCasts) / this.totalDeathCoilCasts;
    const tooltipText = this.owner.formatItemDamageDone(this.freeCastDamage);
    return {
      id: `spell-${SPELLS.UNHOLY_DEATH_KNIGHT_T21_4SET_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.UNHOLY_DEATH_KNIGHT_T21_4SET_BONUS.id} />,
      title: <SpellLink id={SPELLS.UNHOLY_DEATH_KNIGHT_T21_4SET_BONUS.id} />,
      result: <dfn data-tip={tooltipText}>
        <span>{formatPercentage(freeDeathcoils)} % of Death Coil casts dealt damage a second time</span>
      </dfn>,
    };
  }
}

export default Tier21_4p;