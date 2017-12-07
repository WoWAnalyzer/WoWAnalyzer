import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/**
 * Shocklight
 * While Concordance of the Legionfall is active, your critical strike is increased by 1500.
 */

const CRIT_AMOUNT = 1500;

class Shocklight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  traitLevel = 0

  on_initialized() {
    this.traitLevel = this.combatants.selected.traitsBySpellId[SPELLS.SHOCKLIGHT_TRAIT.id];
    this.active = this.traitLevel > 0;
  }

  subStatistic() {
    const shockLightUptime = this.combatants.selected.getBuffUptime(SPELLS.SHOCKLIGHT_BUFF.id) / this.owner.fightDuration;
    const averageCritGained = shockLightUptime * CRIT_AMOUNT * this.traitLevel;
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.SHOCKLIGHT_TRAIT.id}>
            <SpellIcon id={SPELLS.SHOCKLIGHT_TRAIT.id} noLink /> Shocklight
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {formatNumber(averageCritGained)} avg. crit gained
        </div>
      </div>
    );
  }
}

export default Shocklight;
