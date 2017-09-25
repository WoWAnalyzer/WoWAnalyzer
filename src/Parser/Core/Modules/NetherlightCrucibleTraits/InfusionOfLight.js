import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingDone from 'Parser/Core/Modules/HealingDone';

/**
 * Infusion of Light
 * Your harmful spells and abilities have the chance to deal 101000 additional Holy damage. Your helpful spells and abilities have a chance to heal for 101000.
 */
class InfusionOfLight extends Module {
  static dependencies = {
    combatants: Combatants,
    healingDone: HealingDone,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.INFUSION_OF_LIGHT_TRAIT.id] > 0;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.INFUSION_OF_LIGHT_DAMAGE.id){
      return;
    }

    this.damage += (event.amount || 0) + (event.absorbed || 0) + (event.overkill || 0);
  }
  subStatistic() {
    const healing = this.healingDone.byAbility(SPELLS.INFUSION_OF_LIGHT_HEALING.id).effective;

    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.INFUSION_OF_LIGHT_TRAIT.id}>
            <SpellIcon id={SPELLS.INFUSION_OF_LIGHT_TRAIT.id} noLink /> Infusion Of Light
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
        {formatPercentage(this.owner.getPercentageOfTotalHealingDone(healing))} % healing<br />
        {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % damage
        </div>
      </div>
    );
  }
}

export default InfusionOfLight;
