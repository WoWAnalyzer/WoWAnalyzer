import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

/**
 * Murderous Intent
 * Your Versatility is increased by 1500 while Concordance of the Legionfall is active.
 */
class MurderousIntent extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.MURDEROUS_INTENT_TRAIT.id] > 0;
  }

  subStatistic() {
    const murderousIntentUptime = this.combatants.selected.getBuffUptime(SPELLS.MURDEROUS_INTENT_BUFF.id) / this.owner.fightDuration;
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.MURDEROUS_INTENT_BUFF.id}>
            <SpellIcon id={SPELLS.MURDEROUS_INTENT_BUFF.id} noLink /> Murderous Intent
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(murderousIntentUptime)} % uptime
        </div>
      </div>
    );
  }
}

export default MurderousIntent;
