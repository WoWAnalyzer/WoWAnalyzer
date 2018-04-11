import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber } from 'common/format';

/**
 * Master of Shadows
 * Mastery increased by 500.
 * Avoidance increased by 500.
 */

const MASTERY_AMOUNT = 500;
const AVOIDANCE_AMOUNT = 500;

class MasterOfShadows extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.traitLevel = this.combatants.selected.traitsBySpellId[SPELLS.MASTER_OF_SHADOWS_TRAIT.id];
    this.active = this.traitLevel > 0;
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.MASTER_OF_SHADOWS_TRAIT.id} />
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`${this.traitLevel} ${this.traitLevel > 1 ? `traits` : `trait`}`}>
            {formatNumber(this.traitLevel * MASTERY_AMOUNT)} mastery gained
            <br />
            {formatNumber(this.traitLevel * AVOIDANCE_AMOUNT)} avoidance gained
          </dfn>
        </div>
      </div>
    );
  }
}

export default MasterOfShadows;
