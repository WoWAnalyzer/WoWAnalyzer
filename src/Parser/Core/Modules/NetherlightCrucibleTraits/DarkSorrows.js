import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/**
 * Dark Sorrows
 * Your spells and abilities have a chance to afflict the target with Sorrow, causing it to burst after 8 sec, dealing 133100 Shadow damage.
 */
class DarkSorrows extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.traitLevel = this.combatants.selected.traitsBySpellId[SPELLS.DARK_SORROWS_TRAIT.id];
    this.active = this.traitLevel > 0;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.DARK_SORROWS_DAMAGE.id) {
      return;
    }

    this.damage += (event.amount || 0) + (event.absorbed || 0) + (event.overkill || 0);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.DARK_SORROWS_TRAIT.id} />
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`${this.traitLevel} ${this.traitLevel > 1 ? `traits` : `trait`}`}>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % damage
          </dfn>
        </div>
      </div>
    );
  }
}

export default DarkSorrows;
