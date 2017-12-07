import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/**
 * Murderous Intent
 * Your Versatility is increased by 1500 while Concordance of the Legionfall is active.
 */

const VERSATILITY_AMOUNT = 1500;

class MurderousIntent extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.traitLevel = this.combatants.selected.traitsBySpellId[SPELLS.MURDEROUS_INTENT_TRAIT.id];
    this.active = this.traitLevel > 0;
  }

  subStatistic() {
    const murderousIntentUptime = this.combatants.selected.getBuffUptime(SPELLS.MURDEROUS_INTENT_BUFF.id) / this.owner.fightDuration;
    const averageVersatilityGained = murderousIntentUptime * VERSATILITY_AMOUNT * this.traitLevel;

    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.MURDEROUS_INTENT_BUFF.id}>
            <SpellIcon id={SPELLS.MURDEROUS_INTENT_BUFF.id} noLink /> Murderous Intent
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {formatNumber(averageVersatilityGained)} avg. vers gained
        </div>
      </div>
    );
  }
}

export default MurderousIntent;
