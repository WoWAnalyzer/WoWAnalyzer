import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingDone from 'Parser/Core/Modules/HealingDone';

/**
 * Infusion of Light
 * Your harmful spells and abilities have the chance to deal 101000 additional Holy damage. Your helpful spells and abilities have a chance to heal for 101000.
 */
class InfusionOfLight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    healingDone: HealingDone,
  };

  damage = 0;

  on_initialized() {
    this.traitLevel = this.combatants.selected.traitsBySpellId[SPELLS.INFUSION_OF_LIGHT_TRAIT.id];
    this.active = this.traitLevel > 0;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.INFUSION_OF_LIGHT_DAMAGE.id) {
      return;
    }

    this.damage += (event.amount || 0) + (event.absorbed || 0) + (event.overkill || 0);
  }
  subStatistic() {
    const healing = this.healingDone.byAbility(SPELLS.INFUSION_OF_LIGHT_HEALING.id).effective;

    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.INFUSION_OF_LIGHT_TRAIT.id} />
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`${this.traitLevel} ${this.traitLevel > 1 ? `traits` : `trait`}`}>
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(healing))} % healing<br />
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % damage
          </dfn>
        </div>
      </div>
    );
  }
}

export default InfusionOfLight;
