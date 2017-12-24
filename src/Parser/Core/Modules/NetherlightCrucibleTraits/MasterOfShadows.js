import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber } from 'common/format';

/**
 * Master of Shadows
 * Mastery increased by 500.
 * Avoidance increased by 1000.
 */

const MASTERY_AMOUNT = 500;
const AVOIDANCE_AMOUNT = 1000;

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
          <SpellLink id={SPELLS.MASTER_OF_SHADOWS_TRAIT.id}>
            <SpellIcon id={SPELLS.MASTER_OF_SHADOWS_TRAIT.id} noLink /> Master Of Shadows
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {formatNumber(this.traitLevel * MASTERY_AMOUNT)} mastery gained
          <br />
          {formatNumber(this.traitLevel * AVOIDANCE_AMOUNT)} avoidance gained
        </div>
      </div>
    );
  }
}

export default MasterOfShadows;
