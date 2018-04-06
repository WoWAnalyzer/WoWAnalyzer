import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingDone from 'Parser/Core/Modules/HealingDone';

/**
 * Refractive Shell
 * Your spells and abilities have the chance to cause Refractive Shell, absorbing 300000 damage. Lasts 10 sec.
 */
class RefractiveShell extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    healingDone: HealingDone,
  };

  healing = 0;

  on_initialized() {
    this.traitLevel = this.combatants.selected.traitsBySpellId[SPELLS.REFRACTIVE_SHELL_TRAIT.id];
    this.active = this.traitLevel > 0;
  }

  subStatistic() {
    const healing = this.healingDone.byAbility(SPELLS.REFRACTIVE_SHELL_BUFF.id).effective;
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.REFRACTIVE_SHELL_TRAIT.id} />
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`${this.traitLevel} ${this.traitLevel > 1 ? `traits` : `trait`}`}>
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(healing))} % healing
          </dfn>
        </div>
      </div>
    );
  }
}

export default RefractiveShell;
