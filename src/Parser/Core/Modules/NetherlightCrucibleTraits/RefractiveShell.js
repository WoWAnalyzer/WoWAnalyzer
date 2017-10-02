import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingDone from 'Parser/Core/Modules/HealingDone';

/**
 * Refractive Shell
 * Your spells and abilities have the chance to cause Refractive Shell, absorbing 300000 damage. Lasts 10 sec.
 */
class RefractiveShell extends Module {
  static dependencies = {
    combatants: Combatants,
    healingDone: HealingDone,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.REFRACTIVE_SHELL_TRAIT.id] > 0;
  }

  subStatistic() {
    const healing = this.healingDone.byAbility(SPELLS.REFRACTIVE_SHELL_BUFF.id).effective;
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.REFRACTIVE_SHELL_TRAIT.id}>
            <SpellIcon id={SPELLS.REFRACTIVE_SHELL_TRAIT.id} noLink /> Refractive Shell
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
        {formatPercentage(this.owner.getPercentageOfTotalHealingDone(healing))} % healing
        </div>
      </div>
    );
  }
}

export default RefractiveShell;
