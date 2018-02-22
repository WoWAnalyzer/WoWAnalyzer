import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingDone from 'Parser/Core/Modules/HealingDone';

/**
 * Secure in the Light
 * Your harmful spells and abilities have the chance to deal 135000 additional damage and grant you Holy Bulwark, absorbing up to 135000 damage over 8 sec.
 */
class SecureInTheLight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    healingDone: HealingDone,
  };

  damage = 0;

  on_initialized() {
    this.traitLevel = this.combatants.selected.traitsBySpellId[SPELLS.SECURE_IN_THE_LIGHT_TRAIT.id];
    this.active = this.traitLevel > 0;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.SECURE_IN_THE_LIGHT_DAMAGE.id) {
      return;
    }

    this.damage += (event.amount || 0) + (event.absorbed || 0) + (event.overkill || 0);
  }
  subStatistic() {
    const healing = this.healingDone.byAbility(SPELLS.HOLY_BULWARK.id).effective;

    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.SECURE_IN_THE_LIGHT_TRAIT.id}>
            <SpellIcon id={SPELLS.SECURE_IN_THE_LIGHT_TRAIT.id} noLink /> Secure in the Light
          </SpellLink>
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

export default SecureInTheLight;
