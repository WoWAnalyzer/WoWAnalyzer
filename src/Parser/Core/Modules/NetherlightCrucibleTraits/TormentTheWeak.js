import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

/**
 * Torment the Weak
 * Your spells and abilities have a chance to deal 80000 Shadow damage over 15 sec. This effect stacks up to 3 times.
 */
class TormentTheWeak extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.TORMENT_THE_WEAK_TRAIT.id] > 0;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.TORMENT_THE_WEAK_DAMAGE.id){
      return;
    }

    this.damage += (event.amount || 0) + (event.absorbed || 0) + (event.overkill || 0);
  }
  
  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.TORMENT_THE_WEAK_TRAIT.id}>
            <SpellIcon id={SPELLS.TORMENT_THE_WEAK_TRAIT.id} noLink /> Torment the Weak
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
        {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % damage
        </div>
      </div>
    );
  }
}

export default TormentTheWeak;
